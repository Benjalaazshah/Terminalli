import C from "kleur";

/**
 * Data for the `Terminal` class.
 */
export interface TerminalData {
	showDate: boolean;
	showLevelName: boolean;
	showRelativeTimestamp: boolean;
	showTimestamp: boolean;
	showTimestampRelativeToLastLog: boolean;
}

/**
 * Represents the console.
 */
export default class Terminal {
	/**
	 * Customization options that were inputted when this terminal instance was created.
	 */
	readonly data: TerminalData;

	/**
	 * The time when this terminal instance was created.
	 */
	readonly startTime: Date;

	/**
	 * The time when the last message was logged to the terminal.
	 */
	timeInLastLog: Date;

	private _log(level: "ERROR" | "LOG", message: string) {
		const time = new Date();
		let output = "";
		const levelColor = level === "ERROR" ? (x: string) => C.underline().dim().red(x) : (x: string) => C.bold().black(x);

		function formatChangeInTime(from: Date, prefix: string) {
			let formattedChangeInTime = "";
			let remainder = time.getTime() - from.getTime();

			function addUnitOfTime(unitValueInMilliseconds: number, unitName: string) {
				const unitCount = Math.floor(remainder / unitValueInMilliseconds);

				remainder = remainder % unitValueInMilliseconds;
				formattedChangeInTime += unitCount !== 0 ? levelColor(prefix + unitCount + unitName) + " " : "";
			}

			addUnitOfTime(31536000000, "y"); // YEARS
			addUnitOfTime(2592000000, "m"); // MONTHS
			addUnitOfTime(86400000, "d"); // DAYS
			addUnitOfTime(3600000, "h"); // HOURS
			addUnitOfTime(60000, "min"); // MINUTES
			addUnitOfTime(1000, "s"); // SECONDS
			addUnitOfTime(1, "ms"); // MILLISECONDS

			return formattedChangeInTime;
		}

		// Should look like: [ ERROR ]
		if (this.data.showLevelName) output += `[ ${levelColor(level)} ]\t`;

		// Should look like: [ 12d/5m/2011y | 13:43:10.23 ]
		if (this.data.showDate || this.data.showTimestamp) {
			output += "[ ";
			if (this.data.showDate) output += levelColor(`${time.getDate()}d/${time.getMonth()}m/${time.getFullYear()}y`) + " ";
			if (this.data.showDate && this.data.showTimestamp) output += "| ";
			if (this.data.showTimestamp) output += levelColor(`${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}.${time.getMilliseconds()}`) + " ";
			output += "]\t";
		}

		// Should look like: [ 5y 1m 15h 51min 7s 300ms | +31min +5s +903ms ]
		if (this.data.showRelativeTimestamp || this.data.showTimestampRelativeToLastLog) {
			output += "[ ";
			if (this.data.showRelativeTimestamp) output += formatChangeInTime(this.startTime, "");
			if (this.data.showRelativeTimestamp && this.data.showTimestampRelativeToLastLog) output += "| ";
			if (this.data.showTimestampRelativeToLastLog) output += formatChangeInTime(this.timeInLastLog, "+");
			output += "]\t";
		}

		output += `${message}\n`;
		(level === "ERROR" ? process.stderr : process.stdout).write(output);
		this.timeInLastLog = time;
	}

	/**
	 * Logs a message to the `process.stdout`.
	 * @param message The message to be logged to the terminal.
	 */
	log(message: string) {
		this._log("LOG", message);
	}

	/**
	 * Logs an error message to `process.stderr`.
	 * @param errorMessage The error message to be logged to the terminal.
	 */
	error(errorMessage: string) {
		this._log("ERROR", errorMessage);
	}

	/**
	 * Represents the console.
	 * @param data Customization options for the terminal.
	 */
	constructor(data?: Partial<TerminalData>) {
		const defaultData: TerminalData = {
			showDate: true,
			showLevelName: false,
			showRelativeTimestamp: true,
			showTimestamp: true,
			showTimestampRelativeToLastLog: true
		};

		this.startTime = new Date();
		this.timeInLastLog = this.startTime;
		this.data = data ? Object.assign({}, defaultData, data) : defaultData;
	}
}
