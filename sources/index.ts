import C from "kleur";
import { Level, TerminalConstructorData, TerminalData } from "./types";

/**
 * Represents the console.
 */
export default class Terminal<L extends Level[]> {
	/**
	 * Customization options that were inputted when this terminal instance was created.
	 */
	readonly data: TerminalData;
	readonly log: Record<L[number]["name"], (message: string) => void>;

	/**
	 * The time when this terminal instance was created.
	 */
	readonly startTime: Date;

	/**
	 * The time when the last message was logged to the terminal.
	 */
	timeInLastLog: Date;

	private _log(level: Level, message: string) {
		const time = new Date();
		let levelColor = C[level.color[0]];
		let output = "";

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

		for (let i = 1; i <= level.color.length; i++) levelColor = levelColor()[level.color[i]];

		// Should look like: [ ERROR ]
		if (this.data.showLevelName) output += `[ ${levelColor(level.name)} ]\t`;

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
		(level.isError ? process.stderr : process.stdout).write(output);
		this.timeInLastLog = time;
	}

	constructor(data?: Partial<TerminalConstructorData<L>>) {
		const defaultData: TerminalData = {
			levels: [
				{ color: ["black", "bold"], name: "trace", isError: false },
				{ color: ["red", "underline"], name: "error", isError: true }
			],

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
