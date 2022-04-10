// import C from "kleur";
import { TerminalData } from "./types";

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

	constructor(data?: Partial<TerminalData>) {
		const defaultData: TerminalData = {
			levels: [
				{ color: ["black", "bold"], name: "trace" },
				{ color: ["red", "underline"], name: "error" }
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
