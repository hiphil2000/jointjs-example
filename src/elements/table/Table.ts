import { EventsHash } from "backbone";
import { dia, g, V, VElement } from "jointjs";
import { v4 } from "uuid";

export interface ITableRow {
	id: string;
	name: string;
	type: string;
}

const rowDefaults = {
	markup: `
		<g class="table-row">
			<rect class="table-row-body" />
			<label class="table-row-label row-name" />
			<label class="table-row-label row-type" />
		</g>
	`,
	attrs: {
		".table-row-body": {
			refWidth: "200px",
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeWidth: "1",
		},
		".table-row-label": {
			fontFamily: "Arial",
			fontSize: 11,
			stroke: "none",
			fill: "#000000",
			yAlignment: "middle"
		}
	},
} as dia.Element.PortGroup

export default class Table extends dia.Element {
	static readonly TABLE_MARKUP = [
		'<rect class="body" />',
		'<text class="name" />',
		'<g class="rows">',
		'</g>',
	].join("");

	static readonly ROW_MARKUP = [
		'<g class="row" data-row-id="">',
		'<rect class="row-body" />',
		'<text class="row-name" />',
		'<text class="row-type" />',
		'</g>',
	].join("");

	defaults(): Partial<dia.Element.Attributes> {
		return {
			...super.defaults,
			type: "erd.Table",
			tableName: "",
			rows: [],
			rowHeight: 28,
			minWidth: 200,
			attrs: {
				"text": {
					fontFamily: "Arial",
					fontSize: 13,
					stroke: "none",
					fill: "#000000",
				},
				".body": {
					refWidth: "100%",
					refHeight: "100%",
					fill: "#FFFFFF",
					stroke: "#000000",
					strokeWidth: "1",
				},
				".name": {
					refX: 8,
					refY: 14,
					yAlignment: "middle",
					pointerEvents: "none",
				},
			},
			markup: Table.TABLE_MARKUP,
			rowMarkup: Table.ROW_MARKUP,
			// ports: {
			// 	groups: {
			// 		"relation": {
			// 			...rowDefaults,
			// 		}
			// 	}
			// },
			size: {
				width: 200,
				height: 28
			}
		}
	}

	initialize(attributes?: dia.Element.Attributes, options?: any): void {
		super.initialize.call(this, attributes, options);
		
		this.on("change:rowHeight", function() {
			this.attr(".options/refY", this.rowHeight, {silent: true});
		}, this);
		this.on("change:rows", function(...args) {
			this.handleRowsChange()
		}, this);

		this.handleRowsChange();
	}

	computePosition(ports: dia.Element.Port[], bbox: g.Rect): dia.Point[] {
		const rowHeight = this.get("rowHeight");

		return ports.map((_, idx) => ({x: 0, y: idx * rowHeight}));
	}
	
	handleRowsChange(): void {
		// update attrs
		const rows = this.get("rows") as ITableRow[];
		const attrs = this.get("attrs");

		// remove expired attributes
		ForEachObject(attrs, (attr, key) => {
			const classList = key.toString().split(" ");
			if (classList.includes(".row")) {
				// do something
			}
		});

		// add new attributes
		rows.forEach((row, index) => {
			const selectors = this.createRowAttr(row, index);
			Object.keys(selectors).forEach(k => attrs[k] = selectors[k]);
		});

		this.set("attrs", attrs);
		this.adjustLayout();
	}

	createRowAttr(row: ITableRow, index: number): dia.Cell.Selectors {
		const rowWidth = this.get("minWidth");
		const rowHeight = this.get("rowHeight");

		return {
			[`.rows .row[data-row-id="${row.id}"]`]: {
				transform: `translate(0, ${4 + (index + 1) * rowHeight})`
			},
			[`.rows .row[data-row-id="${row.id}"] .row-body`]: {
				width: rowWidth,
				height: rowHeight,
				fill: "transparent",
			},
			[`.rows .row[data-row-id="${row.id}"] .row-type`]: {
				text: row.type,
				refX: rowWidth - 16,
				refY: rowHeight / 2,
				xAlignment: "right",
				textVerticalAnchor: "middle",
			},
			[`.rows .row[data-row-id="${row.id}"] .row-name`]: {
				text: row.name,
				refX: 16,
				refY: rowHeight / 2,
				xAlignment: "left",
				textVerticalAnchor: "middle"
			}
		}
	}
	
	adjustLayout(): void {
		const width = this.get("minWidth");
		const height = (this.get("rows").length + 1) * this.get("rowHeight") + 8;

		this.resize(width, height);
	}

	addRow(row: ITableRow): void {
		this.set("rows", this.get("rows").push(row));
	}
}

export class TableView extends dia.ElementView {
	public static readonly ROW_ID = "row-id";

	$rows: JQuery;
	rowElem: VElement;

	events(): EventsHash {
		return {
			"pointerdown": "onAddRow",
		}
	}

	presentationAttributes(): dia.CellView.PresentationAttributes {
		return dia.ElementView.addPresentationAttributes({
			rows: ["ROWS"]
		})
	}

	confirmUpdate(flag: number, opt: { [key: string]: any; }): number {
		super.confirmUpdate.apply(this, arguments);
		console.log(flag);
		if (this.hasFlag(flag, "ROWS")) {
			this.renderRows();
			return 1;
		} else {
			return 0;
		}
	}

	protected renderMarkup(): void {
		super.renderMarkup.apply(this, arguments);
		this.$rows = this.$(".rows");
		this.rowElem = V(this.model.get("rowMarkup"));

		this.renderRows();
	}

	private findRow(id: string): JQuery {
		return this.$rows.find(`.row[data-row-id="${id}"]`);
	}

	private renderRows(): void {
		const rows = this.model.get("rows") as ITableRow[];
		// const elemIds = this.$rows.find(".row").map()

		// 신규 Attr에 없는 Element 삭제

		// this.$rows.find(".row").each((idx, elem) => {
		// 	if (!rows.find(r => r.id === elem.getAttribute(TableView.ROW_ID))) {
		// 		elem.remove();
		// 	}
		// });

		rows.forEach((row) => {
			if (this.findRow(row.id).length === 0) {
				const newElem = this.rowElem.clone();
				newElem.attr("data-row-id", row.id);
				this.$rows.append(newElem.node);
			}

			// if (this.$rows.find(".row." + row.id).length === 0) {
			// 	const newElem = this.rowElem.clone().addClass(row.id);
			// 	newElem.attr(TableView.ROW_ID, row.id);
			// 	this.$rows.append(newElem.node);
			// }
		});

		this.update();
	}

	protected onAddRow(e:any):void {
		console.log( e.target);
		if (e.originalEvent.path.find(x => x.classList?.contains("row")) != undefined) {
			e.preventDefault();
		}
	}
}

function ForEachObject<O>(object: O, iterator: (item: O[keyof O], key: keyof O) => void): void {
	const keys = Object.keys(object) as (keyof O)[];
	keys.forEach(key => {
		const item = object[key];
		iterator(item, key);
	});
}