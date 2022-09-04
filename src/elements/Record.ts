import { shapes } from "jointjs"

export default class Record extends shapes.standard.Rectangle {
	public static readonly RECORD_HEIGHT: number = 28;

	defaults(): Partial<shapes.standard.RectangleAttributes> {
		return {
			...super.defaults,
			attrs: {
				body: {
					width: "calc(w)",
					height: "calc(h)",
					fill: "#EFEFEF",
					stroke: "#CCCCCC",
					strokeWidth: 1,
				},
				name: {
					fontSize: 12,
					fill: "#000000",
				}
			},
			markup: [
				{tagName: "rect", selector: "body"},
				{tagName: "text", selector: "name"},
			],
			draggable: false,
			type: "Record",
			size: {
				width: 200,
				height: Record.RECORD_HEIGHT
			}
		}
	}

	initialize(attributes?: shapes.standard.RectangleAttributes, options?: any): void {
		super.initialize.call(this, attributes);
	}
}