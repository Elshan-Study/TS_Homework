// @Task1
class CssObject {
    private selector: string;
    private styles: Record<string, string>;

    constructor(selector: string = "") {
        this.selector = selector;
        this.styles = {};
    }

    setSelector(selector?: string | null): this {
        if (selector === undefined || selector === null) return this;
        this.selector = String(selector).trim();
        return this;
    }

    addStyle(key: string, value: string | number): this {
        if (!key) return this;
        this.styles[String(key).trim()] = String(value);
        return this;
    }

    removeStyle(key: string): this {
        delete this.styles[key];
        return this;
    }

    getCss(): string {
        let stylesText = "";
        for (const key in this.styles) {
            stylesText += `\n    ${key}: ${this.styles[key]};`;
        }
        return `${this.selector} {${stylesText}\n}`;
    }
}

// @Task2
interface HtmlAttribute {
    name: string;
    value: string | null;
}

class HtmlObject {
    tagName: string;
    selfClosing: boolean;
    textContent: string;
    attributes: HtmlAttribute[];
    styles: Record<string, string>;
    children: HtmlObject[];

    constructor(
        tagName: string = 'div',
        selfClosing: boolean = false,
        textContent: string = '',
        attributes: HtmlAttribute[] = [],
        styles: Record<string, string> = {},
        children: HtmlObject[] = []
    ) {
        this.tagName = String(tagName);
        this.selfClosing = Boolean(selfClosing);
        this.textContent = textContent == null ? '' : String(textContent);
        this.attributes = Array.isArray(attributes) ? [...attributes] : [];
        this.styles = { ...styles };
        this.children = Array.isArray(children) ? [...children] : [];
    }

    setAttribute(name: string, value: string | number | null): this {
        name = String(name);
        const idx = this.attributes.findIndex(a => a.name === name);
        const val = value == null ? null : String(value);
        if (idx >= 0 && this.attributes[idx]) {
            this.attributes[idx]!.value = val;
        } else {
            this.attributes.push({ name, value: val });
        }
        return this;
    }

    setStyle(key: string, value: string | number): this {
        this.styles[String(key)] = String(value);
        return this;
    }

    appendChild(htmlObject: HtmlObject): this {
        if (!(htmlObject instanceof HtmlObject)) {
            throw new Error('appendChild expects HtmlObject');
        }
        this.children.push(htmlObject);
        return this;
    }

    prependChild(htmlObject: HtmlObject): this {
        if (!(htmlObject instanceof HtmlObject)) {
            throw new Error('prependChild expects HtmlObject');
        }
        this.children.unshift(htmlObject);
        return this;
    }

    private _escapeText(text: string): string {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    private _attributesToString(): string {
        const parts: string[] = [];

        for (const attr of this.attributes) {
            if (attr.value === null || attr.value === undefined || attr.value === '') {
                parts.push(`${attr.name}`);
            } else {
                const val = String(attr.value).replace(/"/g, '&quot;');
                parts.push(`${attr.name}="${val}"`);
            }
        }

        const styleKeys = Object.keys(this.styles);
        if (styleKeys.length > 0) {
            const styleText = styleKeys.map(k => `${k}: ${this.styles[k]};`).join(' ');
            parts.push(`style="${styleText.replace(/"/g, '&quot;')}"`);
        }

        return parts.length > 0 ? ' ' + parts.join(' ') : '';
    }

    getHtml(): string {
        const attrs = this._attributesToString();
        if (this.selfClosing) {
            return `<${this.tagName}${attrs} />`;
        } else {
            const innerParts: string[] = [];
            if (this.textContent) innerParts.push(this._escapeText(this.textContent));
            for (const ch of this.children) {
                innerParts.push(ch.getHtml());
            }
            return `<${this.tagName}${attrs}>${innerParts.join('')}</${this.tagName}>`;
        }
    }
}

const card = new HtmlObject('div', false, '', [{ name: 'class', value: 'card' }]);
const img = new HtmlObject('img', true, '', [
    { name: 'src', value: 'https://portal.azertag.az/sites/default/files/YEsas.jpg' },
    { name: 'alt', value: 'image' }
]);
const content = new HtmlObject('div', false, '', [{ name: 'class', value: 'card-content' }]);
const title = new HtmlObject('h2', false, 'Заголовок карточки', [{ name: 'class', value: 'card-title' }]);
const desc = new HtmlObject('p', false,
    'Краткое описание карточки. Здесь может быть любая полезная информация.',
    [{ name: 'class', value: 'card-desc' }]
);
const btn = new HtmlObject('button', false, 'Подробнее', [{ name: 'class', value: 'card-btn' }]);

content.appendChild(title).appendChild(desc).appendChild(btn);
card.appendChild(img).appendChild(content);

const cssCard = new CssObject().setSelector('.card')
    .addStyle('width', '320px')
    .addStyle('border', '1px solid #ddd')
    .addStyle('border-radius', '8px')
    .addStyle('overflow', 'hidden')
    .addStyle('box-shadow', '0 2px 8px rgba(0,0,0,0.08)')
    .addStyle('font-family', 'Arial, sans-serif')
    .addStyle('margin', '20px');

const cssImg = new CssObject().setSelector('.card img')
    .addStyle('display', 'block')
    .addStyle('width', '100%')
    .addStyle('height', 'auto');

const cssContent = new CssObject().setSelector('.card-content')
    .addStyle('padding', '12px');

const cssTitle = new CssObject().setSelector('.card-title')
    .addStyle('margin', '0 0 8px 0')
    .addStyle('font-size', '18px');

const cssDesc = new CssObject().setSelector('.card-desc')
    .addStyle('margin', '0 0 12px 0')
    .addStyle('font-size', '14px')
    .addStyle('color', '#444');

const cssBtn = new CssObject().setSelector('.card-btn')
    .addStyle('padding', '8px 14px')
    .addStyle('border', 'none')
    .addStyle('border-radius', '4px')
    .addStyle('background-color', '#1976d2')
    .addStyle('color', '#fff')
    .addStyle('cursor', 'pointer');

const cssBlocks = [
    cssCard.getCss(),
    cssImg.getCss(),
    cssContent.getCss(),
    cssTitle.getCss(),
    cssDesc.getCss(),
    cssBtn.getCss()
].join('\n\n');

// для браузера можно раскомментировать:
document.write(`<style>\n${cssBlocks}\n</style>`);
document.write(card.getHtml());

// @Task3
class ExtendedDate extends Date {
    constructor(...args: ConstructorParameters<typeof Date>) {
        super(...args);
    }

    toReadableString(): string {
        const months = [
            'января','февраля','марта','апреля','мая','июня',
            'июля','августа','сентября','октября','ноября','декабря'
        ];
        const d = this.getDate();
        const m = this.getMonth();
        return `${d} ${months[m]}`;
    }

    IsFuture(): boolean {
        const now = new Date();
        return this.getTime() >= now.getTime();
    }

    IsLeapYear(): boolean {
        const y = this.getFullYear();
        return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    }
}

const edFuture = new ExtendedDate('2030-12-25T00:00:00');
const edPast = new ExtendedDate('2000-02-29T00:00:00');

console.log('edFuture', edFuture.toReadableString(), edFuture.IsFuture(), edFuture.IsLeapYear());
console.log('edPast', edPast.toReadableString(), edPast.IsFuture(), edPast.IsLeapYear());


