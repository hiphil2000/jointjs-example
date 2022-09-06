import {dia, V} from "jointjs"

export interface ICustomPaperOptions extends dia.Paper.Options {
	chunkWidth?: number;
	chunkHeight?: number;
}

const defaults = {
	chunkWidth: 1000,
	chunkHeight: 1000,
} as ICustomPaperOptions

export default class CustomPaper extends dia.Paper {
	protected options: ICustomPaperOptions;

	constructor(opt: ICustomPaperOptions) {
		super({
			...defaults,
			...opt,
		});
	}
	
	// lodash.result로 조회하기 때문에 type을 무시하고 function으로 설정합니다.
	// @ts-ignore
	className() {
		return "custom-paper";
	}

	// lodash.result로 조회하기 때문에 type을 무시하고 function으로 설정합니다.
	// @ts-ignore
	children() {
		const namespace = (V as any).namespace;
		return [{
			namespaceURI: namespace.xhtml,
			tagName: 'div',
			className: 'joint-paper-custom-background',
			attributes: {
				'width': this.options.chunkWidth + "px",
				'height': this.options.chunkHeight + "px",
			},
			selector: 'background'
		}, {
			namespaceURI: namespace.xhtml,
			tagName: 'div',
			className: 'joint-paper-grid',
			selector: 'grid'
		}, {
			namespaceURI: namespace.svg,
			tagName: 'svg',
			attributes: {
				'width': this.options.chunkWidth,
				'height': this.options.chunkHeight,
				'xmlns:xlink': namespace.xlink
			},
			selector: 'svg',
			children: [{
				// Append `<defs>` element to the SVG document. This is useful for filters and gradients.
				// It's desired to have the defs defined before the viewport (e.g. to make a PDF document pick up defs properly).
				tagName: 'defs',
				selector: 'defs'
			}, {
				tagName: 'g',
				className: 'joint-layers',
				selector: 'layers'
			}]
		}];
	}
	
	protected init(): void {
		console.log("init");
		super.init();
	}

	_setDimensions(): void {

	}

	render(): this {
		console.log("render");
		super.render();
		return this;
	}

	renderChildren(children?: dia.MarkupJSON): this {
		console.log("renderChild");
		return super.renderChildren(children);
	}
}