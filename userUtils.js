const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const { computeFormula } = require("./computeUtils");
const { processUpdateInput, convertInputFileIntoInitState, printSystemState } = require('./systemUtils');


const printMenu = () => {
    console.log("\na. Print current state")
    console.log("b. Change a value\n")
}

const convertUserInputIntoChangeDetails = (userInput) => {
    const splittedInput = userInput.split(' ')
    const index = splittedInput[1]
    const value = splittedInput[2]
    return { index, value }
}

const getInputFromUser = async () => {
    printMenu()
    let response;
    return new Promise((resolve, reject) => {
        readline.question('# ', userInput => {
            response = userInput;
            resolve(response);
        });
    })
}

const systemInit = (inputFile) => {
    if (!inputFile) return [];
    // fill the values and formulas fields
    let systemState = convertInputFileIntoInitState(inputFile)
    // compute all formulas for the first time
    for (let cell of systemState) {
        if (!cell.value && cell.value !== 0) {
            let value = computeFormula(cell.formula, systemState)
            cell.value = value;
        }
    }
    return systemState;
}
const cleanSpacesFromFormulaInput = (userInput) => {
    if (!userInput.includes('=')) return userInput;
    const cleanFormula = userInput.split(' ').slice(2).join('')

    const newUserInput = userInput.split(' ').slice(0, 2).join(' ') + ' ' + cleanFormula
    return newUserInput;
}
const userSession = async (systemState) => {
    let userInput = await getInputFromUser()
    userInput = cleanSpacesFromFormulaInput(userInput)
    let newSystemState = [...systemState];
    const regexpUpdate = /^b \d+ ((-?\d+)|(=-?((\d+)|({\d+}))([-+\/*]((\d+)|({\d+})))*))$/;
    switch (userInput) {
        case 'a':
            printSystemState(systemState)
            break;
        case (userInput.match(regexpUpdate) || {}).input:
            const { index, value } = convertUserInputIntoChangeDetails(userInput)
            try {
                newSystemState = processUpdateInput(index, value, systemState)
            } catch (error) {
                console.log(error.message);
            }
            break;
        default:
            console.log('Invalid Input!')
            break;
    }
    return newSystemState;
}


module.exports = { userSession, systemInit }