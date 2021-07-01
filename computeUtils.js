const computeFormula = (formula, systemState) => {
    const cleanExpression = replaceReferencesWithValues(formula, systemState)
    const value = calculateExpression(cleanExpression);
    return value;
}
const injectValueIntoFormula = (formula, cellIndex, placeholder, systemState) => {
    let newFormula = formula;
    const cell = systemState[cellIndex];
    let replaceValue = 0;
    if (!cell || cell?.value === 0)
        replaceValue = 0;
    else if (cell.formula)
        replaceValue = computeFormula(cell.formula, systemState)
    else if (cell.value)
        replaceValue = cell.value
    newFormula = newFormula.replace(placeholder, replaceValue)
    return newFormula;
}

const replaceReferencesWithValues = (formula, systemState) => {
    let newFormula = formula;
    const referencExp = /{\d+}/g;
    const allMactchs = [...newFormula.matchAll(referencExp)];
    for (let cellReference of allMactchs) {
        const placeholder = cellReference[0];
        const cellIndex = parseInt(placeholder.slice(1, -1))
        newFormula = injectValueIntoFormula(newFormula, cellIndex, placeholder, systemState)
    }
    return newFormula;
}


const calculateExpression = (expression) => {
    const expressionStack = convertStringExpressionToStack(expression);
    const firstExpressionPart = expressionStack[expressionStack.length - 1];
    const isExpressionStartWithNumber = Number.isInteger(parseInt(firstExpressionPart))
    let result = isExpressionStartWithNumber ? expressionStack.pop() : 0;
    while (expressionStack.length) {
        let operator = expressionStack.pop();
        let number = expressionStack.pop();
        result = calcTwoNumbers(result, operator, number)
    }
    return result
}
const convertStringExpressionToStack = (expression) => {
    const numbers = expression.split(/[^0-9]+/);
    const operators = expression.split(/[0-9]+/).filter(item => item !== "");

    let expressionArray = [];
    for (i = 0; i < numbers.length; i++) {
        expressionArray.push(numbers[i]);
        if (i < operators.length) expressionArray.push(operators[i]);
    }
    expressionArray = expressionArray.filter(item => item !== "");

    const expressionStack = expressionArray.reverse();

    return expressionStack;
}

const calcTwoNumbers = (firstNumber, operator, secondNumber) => {
    firstNumber = parseInt(firstNumber)
    secondNumber = parseInt(secondNumber)
    while (operator.length > 2) {
        operator = operator.replace('+-', '-')
        operator = operator.replace('--', '+')
    }
    switch (operator) {
        case '+':
        case '--':
            return firstNumber + secondNumber;
        case '-':
        case '+-':
            return firstNumber - secondNumber;
        case '*':
        case '*+':
            return firstNumber * secondNumber;
        case '/':
        case '/+':
            return firstNumber / secondNumber;
        case '/-':
            return firstNumber / (-secondNumber);
        case '*-':
            return firstNumber * (-secondNumber);
    }
}





module.exports = { computeFormula }