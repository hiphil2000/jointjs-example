import { EventsHash } from "backbone";
import { dia, V, VElement } from "jointjs";
import { v4 } from "uuid";

export interface ITableRow {
	id: string;
	name: string;
	type: string;
}

export default class Table extends dia.Element {

	defaults(): Partial<dia.Element.Attributes> {
		return {
			...super.defaults,
			type: "erd.Table",
			tableName: "",
			rows: [],
			rowHeight: 28,
			minWidth: 200,
			attrs: {
				".table_body": {
					refWidth: "100%",
					refHeight: "100%",
					fill: "#FFFFFF",
					stroke: "#000000",
					strokeWidth: "1",
				},
				text: {
					fontFamily: "Arial",
					fontSize: 13,
					stroke: "none",
					fill: "#000000"
				},
				".table_name": {
					refX: 8,
					refY: 14,
					yAlignment: "middle"
				},
				".rows": {
					refX: 0,
				},
				".row": {
					fill: "transparent"
				},
				".btn_row-add": {
					transform: "translate(185, -20)",
					cursor: "pointer"
				}
			},
			markup: `
				<rect class="table_body" />
				<text class="table_name" />
				<g class="rows"></g>
				<path class="btn_row-add" d="M5,0 10,0 10,5 15,5 15,10 10,10 10,15 5,15 5,10 0,10 0,5 5,5z"/>
			`,
			rowMarkup: `
				<g class="row">
					<rect class="row_body" />
					<text class="row_name" />
					<text class="row_type" />
				</g>
			`,
			ports: {
				groups: {
					"relation": {
						// position: "left",
						// FIXME: port position randomized for dev
						position: Math.floor(Math.random() * 10) % 2 === 0 ? "left" : "right",
						attrs: {
							circle: {
								magnet: true,
								r: 8
							}
						}
					}
				}

			},
			size: {
				width: 200,
				height: 28
			}
		}
	}

	initialize(attributes?: dia.Element.Attributes, options?: any): void {
		super.initialize.call(this, attributes, options);
		
		this.on("change:rows", this.handleRowsChange, this);
		this.on("change:rowHeight", function() {
			this.attr(".options/refY", this.rowHeight, {silent: true});
		}, this);

		
		this.handleRowsChange();
	}
	
	handleRowsChange(): void {
		// update attrs
		const rows = this.get("rows") as ITableRow[];

		// 신규에 없는 attr 삭제
		const attrs = this.get("attrs");
		ForEachObject(attrs, (item, key) => {
			key = key.toString();

			if (!key.startsWith(".row")) {
				return;
			}

			if (!rows.find(r => key.toString().includes("." + r.id))) {
				this.removeAttr(key.toString(), {silent: true});
			}
		});
		
		// 생성하지 않은 attr 생성
		const keys = Object.keys(attrs);
		const rowHeight = this.get("rowHeight");
		const rowWidth = this.get("minWidth");
		let offsetY = rowHeight;
		rows.forEach((row) => {
			if (!keys.find(k => k === row.id)) {
				attrs[".row." + row.id] = {transform: `translate(0, ${offsetY})`, stroke: "#000000"};
				attrs[".row." + row.id + " .row_body"] = {width: rowWidth, height: rowHeight};
				attrs[".row." + row.id + " .row_name"] = {text: row.name, refX: 16, refY: rowHeight / 2, textVerticalAnchor: "middle"};
				attrs[".row." + row.id + " .row_type"] = {text: row.type, refX: 100, refY: rowHeight / 2, textVerticalAnchor: "middle"};
				
				offsetY += rowHeight;

				const portY = offsetY - rowHeight / 2

				if (!this.getPort(row.id)) {
					this.addPort({
						group: "relation",
						id: row.id,
						args: {
							y: portY
						},
					})
				} else {
					this.portProp(row.id, "args/y", portY);
				}

			}
		})

		this.attr(attrs);

		this.adjustLayout();
	}
	
	adjustLayout(): void {
		const width = this.get("minWidth");
		const height = ((this.get("rows").length) + 1) * this.get("rowHeight");

		this.resize(width, height);
	}

	addRow(row: ITableRow): void {
		const rows = structuredClone(this.get("rows"));
		rows.push(row);
		this.set("rows", rows);
	}
}

export class TableView extends dia.ElementView {
	public static readonly ROW_ID = "row-id";

	$rows: JQuery;
	rowElem: VElement;

	events(): EventsHash {
		return {
			"click .btn_row-add": "onAddRow"
		}
	}

	presentationAttributes(): dia.CellView.PresentationAttributes {
		return dia.ElementView.addPresentationAttributes({
			rows: ["ROWS"]
		})
	}

	confirmUpdate(flag: number, opt: { [key: string]: any; }): number {
		super.confirmUpdate.apply(this, arguments);
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

	private renderRows(): void {
		const rows = this.model.get("rows") as ITableRow[];

		// 신규 Attr에 없는 Element 삭제
		this.$rows.find(".row").each((idx, elem) => {
			if (!rows.find(r => r.id === elem.getAttribute(TableView.ROW_ID))) {
				elem.remove();
			}
		});

		rows.forEach((row) => {
			if (this.$rows.find(".row." + row.id).length === 0) {
				const newElem = this.rowElem.clone().addClass(row.id);
				newElem.attr(TableView.ROW_ID, row.id);
				this.$rows.append(newElem.node);
			}
		});

		this.update();
	}

	protected onAddRow():void {
		(this.model as Table).addRow({
			id: v4(),
			name: "TestName",
			type: "TestType"
		});
	}
}

function ForEachObject<O>(object: O, iterator: (item: O[keyof O], key: keyof O) => void): void {
	const keys = Object.keys(object) as (keyof O)[];
	keys.forEach(key => {
		const item = object[key];
		iterator(item, key);
	});
}