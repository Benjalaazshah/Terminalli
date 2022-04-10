// import C from "kleur";
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

	constructor(data?: Partial<TerminalConstructorData<L>>) {
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
