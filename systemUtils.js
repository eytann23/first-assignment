const { computeFormula } = require("./computeUtils");

const getRelatedCellsFromFormula = (formula) => {
    if (!formula) return [];
    const regexp = /{\d+}/g;
    const allMactchs = [...formula.matchAll(regexp)];
    const relatedCells = allMactchs.map(item => parseInt(item[0].slice(1, -1)))
    return relatedCells;
}

const isInputContainsFormula = (input) => {
    return input[0] === '=';
}

const addNewCell = (input, index, systemState) => {
    const newSystemState = [...systemState]
    if (isInputContainsFormula(input))
        newSystemState[index] = { value: null, formula: input.substring(1), relatedCells: [] }
    else
        newSystemState[index] = { value: parseInt(input), formula: null, relatedCells: [] }
    return newSystemState;
}

const addRelationsToInitState = (initState) => {
    const newInitState = [...initState]
    newInitState.forEach((cell, index) => {
        if (!!cell.formula) {
            const cellsFromFormula = getRelatedCellsFromFormula(cell.formula)
            for (let cell of cellsFromFormula)
                if (!initState[cell].relatedCells.includes(index))
                    initState[cell].relatedCells.push(index)
        }
    });
    return newInitState;
}

//cleaning formula from cell and removing reference from related cells
const cleanFormulaByIndex = (index, systemState) => {
    const newSystemState = [...systemState];
    const allRelatedCells = getRelatedCellsFromFormula(systemState[index].formula)
    for (let cellIndex of allRelatedCells) {
        const relatedCellsIndexes = newSystemState[cellIndex].relatedCells;
        const indexToRemove = relatedCellsIndexes.indexOf(parseInt(index));
        if (indexToRemove > -1)
            relatedCellsIndexes.splice(indexToRemove, 1);
    }
    newSystemState[index].formula = null;
    return newSystemState;
}

const updateRelatedCells = (index, systemState) => {
    let newSystemState = [...systemState];
    const currentRelatedCells = newSystemState[index].relatedCells;
    if (!!currentRelatedCells.length) {
        for (let cellIndex of currentRelatedCells) {
            const value = computeFormula(newSystemState[cellIndex].formula, newSystemState)
            newSystemState = changeValueByIndex(cellIndex, value, newSystemState)
            console.log(`Cell #${cellIndex} changed to ${newSystemState[index].value}`)
        }
    }

    return newSystemState;
}

const changeValueByIndex = (index, inputValue, systemState) => {
    let newSystemState = [...systemState];

    if (isInputContainsFormula(inputValue)) {
        const formula = inputValue.substring(1)
        const value = computeFormula(formula, newSystemState)
        newSystemState[index].value = value
        newSystemState[index].formula = formula
        const cellsIndexesFromFormula = getRelatedCellsFromFormula(formula)
        for (let cellIndex of cellsIndexesFromFormula) {
            if (!newSystemState[cellIndex])
                newSystemState = addNewCell(0, cellIndex, newSystemState)
            newSystemState[cellIndex].relatedCells.push(parseInt(index))
        }
    } else {
        newSystemState[index].value = parseInt(inputValue)
    }
    // update related cells 
    newSystemState = updateRelatedCells(index, newSystemState)

    return newSystemState;
}

const printSystemState = (systemState) => {
    let systemStateString = '';
    systemState.forEach((cell, index) => {
        if (cell) {
            let currentCellString = `[${index}: ${cell.value}]`;
            systemStateString += currentCellString + ', '
        }
    });
    systemStateString = systemStateString.slice(0, -2)
    console.log(systemStateString)
}

const isFormulaLeadsToCircularReference = (baseIndex, formula, systemState) => {
    const cellsFromFormula = getRelatedCellsFromFormula(formula)
    for (let cellIndex of cellsFromFormula) {
        if (baseIndex == cellIndex) {
            return true;
        }
        if (systemState[cellIndex]?.formula) {
            const formulaOfRelatedCell = systemState[cellIndex].formula;
            return isFormulaLeadsToCircularReference(baseIndex, formulaOfRelatedCell, systemState)
        }
    }
    return false;
}

const convertInputFileIntoInitState = (inputFileStr) => {
    inputFileStr = inputFileStr.replace(/ /g, '');
    const inputFileArr = inputFileStr.split(',');

    let initState = [];
    inputFileArr.forEach((input, index) => {
        const isFormulaFileInvalid = isFormulaLeadsToCircularReference(index, input, initState)
        if (isFormulaFileInvalid)
            throw Error('Invalid File: Circular Reference')
        else
            initState = addNewCell(input, index, initState);
    });
    initState = addRelationsToInitState(initState);
    return initState;
}

const processUpdateInput = (index, value, systemState) => {
    let newSystemState = [...systemState];
    if (!!systemState[index]) {
        if (isFormulaLeadsToCircularReference(index, value, systemState))
            throw Error("Circular Reference");
        else {
            newSystemState = cleanFormulaByIndex(index, systemState)
            newSystemState = changeValueByIndex(index, value, systemState)
        }
    } else {
        newSystemState = addNewCell(value, index, systemState)
    }
    console.log(`Cell #${index} changed to ${newSystemState[index].value}`)

    return newSystemState;
}

module.exports = { printSystemState, processUpdateInput, convertInputFileIntoInitState }