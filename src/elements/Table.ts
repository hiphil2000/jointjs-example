import {dia, g} from "jointjs"
import GlobalAttrs from "../global-attrs";
import Record from "./Record";

const ROW_HEIGHT = Record.RECORD_HEIGHT;
const MIN_WIDTH = 200;

const tableAttributes = {
	attrs: {
		root: {
	
		},
		body: {
			width: "calc(w)",
			height: "calc(h)",
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeWidth: 1,
			
		},
		title: {
			transform: `translate(8, 4)`,
			fontFamily: "Arial",
			fontSize: 12,
			fill: "black",
			text: "",
			textWrap: {
				width: 200,
				maxLineCount: 1,
				ellipsis: true
			},
			textVerticalAnchor: "top"
		}
	},
	markup: [
		{ tagName: "rect", selector: "body" },
		{ tagName: "text", selector: "title" },
	]
}

const domainAttribute = {
	attrs: {
		body: {
            magnet: 'active',
			width: "calc(w)",
			height: "calc(h)",
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeWidth: 1,

		},
		lblName: {
			...GlobalAttrs.font,
            pointerEvents: 'none',
			textAnchor: "start",
			yAlignment: "middle",
			transform: "translate(8, 14)",
			textWrap: {
				width: 100,
				maxLineCount: 1,
				ellipsis: true
			},
		},
		lblType: {
			...GlobalAttrs.font,
            pointerEvents: 'none',
			textAnchor: "start",
			yAlignment: "middle",
			transform: "translate(108, 14)",
			textWrap: {
				width: 100,
				maxLineCount: 1,
				ellipsis: true
			},
		}
	},
	size: {
		width: 200,
		height: 28
	},
	markup: [
		{tagName: "rect", selector: "body"},
		{tagName: "text", selector: "lblName"},
		{tagName: "text", selector: "lblType"}
	]
}

export default class Table extends dia.Element {
	private records: Record[] = [];

	defaults(): Partial<dia.Element.Attributes> {
		return {
			...super.defaults,
			...tableAttributes,
			type: "TableElement",
			size: {width: MIN_WIDTH, height: 28},
			ports: {
				groups: {
					"domains": {
						position: (portsArgs: dia.Element.Port[], elBBox: dia.BBox): g.Point[] => {
							return portsArgs.map((port, idx) => {
								return new g.Point(0, 28 * (idx + 1));
							})
						},
						...domainAttribute
					}
				}
			}
		}
	}

	initialize(attributes?: dia.Element.Attributes, options?: any): void {
		super.initialize.call(this, attributes);
	}

	addDomain(name: string, type: string): void {
		this.addPort({
			group: "domains",
			attrs: {
				lblName: {text: name},
				lblType: {text: type}
			}
		});

		this.resize(this.size().width, this.getPorts().length * ROW_HEIGHT);
	}

	embed(cell: Record, opt?: dia.Graph.Options): this {
		if (!(cell instanceof Record)) {
			return;
		}

		console.log(cell);
		super.embed.call(this, cell);
		this.records.push(cell as Record);

		cell.resize(MIN_WIDTH - 2, ROW_HEIGHT);
		
		this.resize(MIN_WIDTH, (this.records.length + 1) * ROW_HEIGHT);
		const {x, y} = this.getBBox().bottomLeft();
		cell.position(x + 1, y - ROW_HEIGHT);
	}
}