import { dia, V, Vectorizer } from "jointjs";
import "./ScrollPaper.css";

export interface IScrollPaperOptions extends dia.Paper.Options {
	el: string | HTMLElement;
	chunkWidth?: number;
	chunkHeight?: number;
}

interface IPanData {
	isPanning: boolean;
	initialPosition: dia.Point | null;
	panAnchor: dia.Point | null;
}

export default class ScrollPaper {
	private _els: {[key: string]: HTMLElement} = {};
	private _paper: dia.Paper;

	private _panData: IPanData = {isPanning: false, initialPosition: null, panAnchor: null};

	public get paper() {
		return this._paper;
	}

	private _options: IScrollPaperOptions;

	constructor(options: IScrollPaperOptions) {
		this._options = {
			chunkWidth: 1000,
			chunkHeight: 1000,
			...options
		}

		this.init();
	}

	protected init(): void {
		if (this._options.el instanceof HTMLElement) {
			this._els.container = this._options.el as HTMLDivElement;
		} else {
			this._els.container = document.getElementById(this._options.el) as HTMLDivElement;
		}

		this.renderElements();
		this.renderPaper();
		this.updateViewport();
	}

	protected renderElements(): void {
		// render conatiner
		this._els.container.className = "scroll-paper";

		// render container-bg
		const containerBg = document.createElement("div");
		this._els.container.appendChild(containerBg);
		this._els.containerBg = containerBg;
		containerBg.className = "scroll-paper-bg";
		containerBg.addEventListener("mousedown", this.handleStartPanning.bind(this));
		containerBg.addEventListener("mousemove", this.handlePanning.bind(this));
		containerBg.addEventListener("mouseup", this.handleStopPanning.bind(this));
		containerBg.addEventListener("mouseout", this.handleStopPanning.bind(this));

		// render paper
		this._els.paperEl = document.createElement("div");
		this._els.containerBg.appendChild(this._els.paperEl);
	}

	protected renderPaper(): void {
		const {paperEl} = this._els;
		this._paper = new dia.Paper({
			...this._options,
			el: paperEl,
		});

		this.paper.model.on("change:position", this.handleChangePosition, this);
		this.paper.model.on("add", this.updateViewport, this);
	}

	/**
	 * Mapping method for joint.Paper.drawGrid(opt)
	 * @param opt drawGrid options
	 */
	public drawGrid(opt?: dia.Paper.GridOptions | dia.Paper.GridOptions[]): void {
		this._paper.drawGrid(opt);
	}

	/**
	 * Mapping method for joint.Paper.matrix(ctm)
	 * @param ctm Matrix 정보
	 */
	public matrix(ctm: DOMMatrix | Vectorizer.Matrix): void {
		// TODO: container-bg도 같이 resize
		this._paper.matrix(ctm);
	}

	private handleChangePosition(cell: dia.CellView) {
		// this.computeChunks();
		this.updateViewport();
	}

	private computeChunks(): void {
		const matrix = this.paper.matrix();
		const contentBBox = this.paper.getContentBBox();
		
	}

	private updateViewport(): void {
		const matrix = this.paper.matrix();
		const bbox = this.paper.getContentBBox();
		const {width: pWidth, height: pHeight} = this.paper.getComputedSize();
		const {chunkWidth, chunkHeight} = this._options;

		// overflows
		if (bbox.x < 0) {
			// left overflow
			this._els.containerBg.style.width = (this._els.containerBg.clientWidth + chunkWidth) + "px";
			this.paper.setDimensions(pWidth + chunkWidth, pHeight);
			this.paper.matrix({...matrix, e: matrix.e + chunkWidth});
			this._els.container.scrollLeft += 1000;
		} else if (bbox.x + bbox.width > pWidth) {
			// right overflow
			this._els.containerBg.style.width = (this._els.containerBg.clientWidth + chunkWidth) + "px";
			this.paper.setDimensions(pWidth + chunkWidth, pHeight);
		} else if (bbox.y < 0) {
			// top overflow
			this._els.containerBg.style.height = (this._els.containerBg.clientHeight + chunkHeight) + "px";
			this.paper.setDimensions(pWidth, pHeight + chunkHeight);
			this.paper.matrix({...matrix, f: matrix.f + chunkWidth});
			this._els.container.scrollTop += 1000;
		} else if (bbox.y + bbox.height > pHeight) {
			// bottom overflow
			this._els.containerBg.style.height = (this._els.containerBg.clientHeight + chunkHeight) + "px";
			this.paper.setDimensions(pWidth, pHeight + chunkHeight);
		}

		// trim
	}

	private handleStartPanning(ev: MouseEvent): void {
		if (this._panData.isPanning === true) {
			return;
		}
		const {container, containerBg} = this._els;
		const {svg} = this.paper.childNodes;

		if (!(ev.target === container || ev.target === containerBg || ev.target === svg)) {
			return;
		}


		this._panData.isPanning = true;
		this._panData.panAnchor = {
			x: ev.clientX,
			y: ev.clientY
		};
		this._panData.initialPosition = {
			x: container.scrollLeft,
			y: container.scrollTop
		}
		
		ev.stopPropagation();
	}

	private handlePanning(ev: MouseEvent): void {
		if (this._panData.isPanning === false) {
			return;
		}
		const {container} = this._els;
		const {x: pX, y: pY} = this._panData.panAnchor;
		const {x: eX, y: eY} = this._panData.initialPosition;

		const xPos = eX - (ev.clientX - pX);
		const yPos = eY - (ev.clientY - pY);

		container.scrollLeft = xPos;
		container.scrollTop = yPos;

		ev.stopPropagation();
	}

	private handleStopPanning(): void {
		this._panData.isPanning = false;
		this._panData.panAnchor = null;
		this._panData.initialPosition = null;
	}
}