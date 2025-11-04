type Nullable<T> = T | null;

class AnimatedSlider {
    private sliderEl: HTMLElement;
    private slides: HTMLElement[];
    private indicatorsEl: HTMLElement;
    private duration = 520;
    private easing = AnimatedSlider.easeInOutQuad;
    private current = 0;
    private isAnimating = false;

    private autoplayTimer: Nullable<number> = null;
    private autoplayInterval = 3000;
    private isPlaying = false;

    constructor(sliderId: string, indicatorsId: string) {
        const slider = document.getElementById(sliderId);
        const ind = document.getElementById(indicatorsId);
        if (!slider || !ind) throw new Error("Slider elements not found");

        this.sliderEl = slider;
        this.indicatorsEl = ind;

        this.slides = Array.from(this.sliderEl.querySelectorAll<HTMLElement>(".slide"));
        if (this.slides.length === 0) throw new Error("No slides found");

        this.slides.forEach((s, i) => {
            const offset = (i - this.current) * 100;
            s.style.transform = `translateX(${offset}%)`;
        });

        this.renderIndicators();
        this.updateIndicators();
        this.attachInteractionHandlers();
    }

    public async next(): Promise<void> {
        const target = (this.current + 1) % this.slides.length;
        await this.goToIndex(target);
    }

    public async prev(): Promise<void> {
        const target = (this.current - 1 + this.slides.length) % this.slides.length;
        await this.goToIndex(target);
    }

    public async first(): Promise<void> {
        await this.goToIndex(0);
    }

    public async last(): Promise<void> {
        await this.goToIndex(this.slides.length - 1);
    }

    public startAutoplay(): void {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.autoplayTimer = window.setInterval(async () => {
            if (this.current === this.slides.length - 1) {
                this.stopAutoplay();
                return;
            }
            await this.next();
            if (this.current === this.slides.length - 1) {
                this.stopAutoplay();
            }
        }, this.autoplayInterval);
    }

    public stopAutoplay(): void {
        if (this.autoplayTimer !== null) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
        this.isPlaying = false;
    }

    public async goTo(index: number): Promise<void> {
        if (index < 0 || index >= this.slides.length) return;
        await this.goToIndex(index);
    }

    private async goToIndex(target: number): Promise<void> {
        if (this.isAnimating || target === this.current) {
            this.current = target;
            this.updateIndicators();
            return;
        }

        this.stopAutoplay();

        this.isAnimating = true;
        this.disableControls(true);

        const fromPositions = this.slides.map((_, i) => (i - this.current) * 100);
        const toPositions = this.slides.map((_, i) => (i - target) * 100);

        await Promise.all(this.slides.map((s, i) =>
            this.animateTranslate(s, fromPositions[i]!, toPositions[i]!, this.duration)
        ));

        this.current = target;
        this.isAnimating = false;
        this.updateIndicators();
        this.disableControls(false);
    }

    private animateTranslate(elem: HTMLElement, fromPercent: number, toPercent: number, durationMs: number): Promise<void> {
        return new Promise((resolve) => {
            const start = performance.now();

            const step = (now: number) => {
                const elapsed = now - start;
                const t = Math.min(elapsed / durationMs, 1);
                const eased = this.easing(t);
                const value = fromPercent + (toPercent - fromPercent) * eased;
                elem.style.transform = `translateX(${value}%)`;

                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    elem.style.transform = `translateX(${toPercent}%)`;
                    resolve();
                }
            };

            requestAnimationFrame(step);
        });
    }

    private disableControls(disable: boolean) {
        const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".controls button"));
        buttons.forEach(b => b.disabled = disable);
    }

    private renderIndicators() {
        this.indicatorsEl.innerHTML = "";
        this.slides.forEach((_, i) => {
            const dot = document.createElement("div");
            dot.className = "indicator";
            dot.dataset.index = String(i);
            dot.title = `Go to slide ${i + 1}`;
            this.indicatorsEl.appendChild(dot);
        });
    }

    private updateIndicators() {
        const dots = Array.from(this.indicatorsEl.children);
        dots.forEach((d, i) => {
            d.classList.toggle("active", i === this.current);
        });
    }

    private attachInteractionHandlers() {
        const btnPrev = document.getElementById("btnPrev")!;
        const btnNext = document.getElementById("btnNext")!;
        const btnFirst = document.getElementById("btnFirst")!;
        const btnLast = document.getElementById("btnLast")!;
        const btnPlay = document.getElementById("btnPlay")!;
        const btnFs = document.getElementById("btnFullscreen")!;

        btnNext.addEventListener("click", async () => {
            this.stopAutoplay();
            await this.next();
            this.updatePlayButton(btnPlay);
        });

        btnPrev.addEventListener("click", async () => {
            this.stopAutoplay();
            await this.prev();
            this.updatePlayButton(btnPlay);
        });

        btnFirst.addEventListener("click", async () => {
            this.stopAutoplay();
            await this.first();
            this.updatePlayButton(btnPlay);
        });

        btnLast.addEventListener("click", async () => {
            this.stopAutoplay();
            await this.last();
            this.updatePlayButton(btnPlay);
        });

        btnPlay.addEventListener("click", () => {
            if (this.isPlaying) {
                this.stopAutoplay();
            } else {
                this.startAutoplay();
            }
            this.updatePlayButton(btnPlay);
        });

        this.indicatorsEl.addEventListener("click", async (ev) => {
            const target = ev.target as HTMLElement;
            if (!target || !target.classList.contains("indicator")) return;
            const idx = Number(target.dataset.index);
            this.stopAutoplay();
            await this.goTo(idx);
            this.updatePlayButton(btnPlay);
        });

        btnFs.addEventListener("click", async () => {
            this.stopAutoplay();
            await this.toggleFullscreen();
            this.updatePlayButton(btnPlay);
        });

        this.sliderEl.addEventListener("pointerdown", () => {
            if (this.isPlaying) {
                this.stopAutoplay();
                this.updatePlayButton(btnPlay);
            }
        });

        window.addEventListener("keydown", async (e) => {
            if (e.key === "ArrowLeft") {
                this.stopAutoplay();
                await this.prev();
                this.updatePlayButton(btnPlay);
            } else if (e.key === "ArrowRight") {
                this.stopAutoplay();
                await this.next();
                this.updatePlayButton(btnPlay);
            }
        });
    }

    private updatePlayButton(btn: HTMLElement) {
        btn.textContent = this.isPlaying ? "⏸ Pause" : "▶ Play";
    }

    private async toggleFullscreen(): Promise<void> {
        const wrap = document.getElementById("sliderWrap")!;
        if (!document.fullscreenElement) {
            try {
                await wrap.requestFullscreen();
            } catch (err) {
                console.warn("Fullscreen failed", err);
            }
        } else {
            try {
                await document.exitFullscreen();
            } catch (err) {
                console.warn("Exit fullscreen failed", err);
            }
        }
    }

    private static easeInOutQuad(t: number) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const slider = new AnimatedSlider("slider", "indicators");

    slider.startAutoplay();
    (window as any).sliderInstance = slider;
});
