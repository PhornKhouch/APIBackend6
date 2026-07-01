const fs = require("fs/promises");
const path = require("path");
const moment = require("moment");

const logError = async (res , error , controller ) => {
    try {
        const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
        const folderPath = path.join(__dirname, "../../logs");

        const filename = `${controller}_${moment().format("YYYY-MM-DD")}.txt`;
        const filePath = path.join(folderPath, filename);
        // Create "logs" folder if missing
        await fs.mkdir(folderPath, { recursive: true });
        const logMessage = `[${timestamp}] ${error.message}\n`;

        await fs.appendFile(filePath, logMessage);

    } catch (error) {
        console.error("Error writing to log file:", error);
    }

    res.status(500).send({
        message: "Internal Server Error",
        isSuccess: false
    });
};

module.exports = logError;
