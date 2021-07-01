const { systemInit, userSession } = require("./userUtils");

const main = async (inputFile) => {
    try {
        let systemState = systemInit(inputFile)
        while (true) {
            systemState = await userSession(systemState)
        }
    } catch (error) {
        console.log(error.message)
    }
}
const inputFile = '2, 18, =2*{0}, 9, ={2}+1*5';
main(inputFile)
