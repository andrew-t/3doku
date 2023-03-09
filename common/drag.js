export default class Drag {
	constructor() {
		this.mouseDrag = null;
		this.touches = {};
		document.body.addEventListener('mouseleave', () => {
			this.end(this.mouseDrag);
			this.mouseDrag = null;
		});
		this.endTouch = e => {
			for (const touch of e.changedTouches) {
				const copy = this.touches[touch.identifier];
				if (!copy) continue;
				this.end(copy);
				delete this.touches[touch.identifier];
			}
		};
		document.body.addEventListener('touchend', this.endTouch);
		document.body.addEventListener('touchcancel', this.endTouch);
		document.body.addEventListener('touchmove', e => {
			for (const touch of e.changedTouches) {
				const copy = this.touches[touch.identifier];
				if (!copy) continue;
				e.preventDefault();
				this.emitMove(copy, { x: touch.screenX, y: touch.screenY });
			}
		});
	}

	// override these
	start(drag) {}
	end(drag) {}
	move(drag) {}

	registerSource(el) {
		el.addEventListener('mousedown', (e) => {
			this.mouseDrag = this.emitStart({ x: e.clientX, y: e.clientY });
			if (this.mouseDeadUntil > Date.now()) return;
			this.start(this.mouseDrag);
		});
		el.addEventListener('mouseup', () => {
			if (this.mouseDrag) this.end(this.mouseDrag);
			this.mouseDrag = null;
		});
		el.addEventListener('mousemove', e => {
			if (!this.mouseDrag) return;
			this.emitMove(this.mouseDrag, { x: e.clientX, y: e.clientY });
		});
		el.addEventListener('touchstart', e => {
			this.mouseDeadUntil = Date.now() + 300;
			for (const touch of e.changedTouches) {
				const copy = this.emitStart({ x: touch.screenX, y: touch.screenY });
				if (copy) this.touches[touch.identifier] = copy;
			}
		});
		el.addEventListener('touchend', this.endTouch);
		el.addEventListener('touchcancel', this.endTouch);
	}

	removeListeners() {
		// TODO: this really should exist
	}

	emitStart(event) {
		const drag = {
			id: Date.now(),
			startX: event.x,
			startY: event.y,
			lastX: event.x,
			lastY: event.y
		}
		if (this.start(drag))
			return drag;
	}
	emitMove(drag, event) {
		this.move({
			totalX: event.x - drag.startX,
			totalY: event.y - drag.startY,
			dX: event.x - drag.lastX,
			dY: event.y - drag.lastY,
			...drag,
			...event
		});
		drag.lastX = event.x;
		drag.lastY = event.y;
	}
}
