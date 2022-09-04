import { dia } from "jointjs";
import GlobalAttrs from "../global-attrs";

const ITEM_WIDTH = 200;
const ITEM_HEIGHT = 28;
const ITEM_PADDING = {
	left: 16,
	top: 8,
	right: 16,
	bottom: 8
}

const domainAttribute = {
	attrs: {
		body: {
			width: "calc(w)",
			height: "calc(h)",
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeWidth: 1,
		},
		lblName: {
			...GlobalAttrs.font,
			textAnchor: "start",
			yAlignment: "middle",
			transform: `translate(${ITEM_PADDING.left}, ${ITEM_PADDING.top})`,
			textWrap: {
				width: 100,
				maxLineCount: 1,
				ellipsis: true
			},
		},
		lblType: {
			...GlobalAttrs.font,
			textAnchor: "start",
			yAlignment: "middle",
			transform: `translate(100, ${ITEM_PADDING.top})`,
			textWrap: {
				width: 100,
				maxLineCount: 1,
				ellipsis: true
			},
		}
	},
	markup: [
		{tagName: "rect", selector: "body"},
		{tagName: "text", selector: "lblName"},
		{tagName: "text", selector: "lblType"}
	]
}

export default class DomainElement extends dia.Element {
	defaults(): Partial<dia.Element.Attributes> {
		return {
			...super.defaults,
			...domainAttribute,
			type: "DomainElement",
			size: {width: ITEM_WIDTH, height: ITEM_HEIGHT}
		}
	};

	initialize(attributes?: dia.Element.Attributes, options?: any): void {
		super.initialize.call(this, this.attributes);
	}

	
}