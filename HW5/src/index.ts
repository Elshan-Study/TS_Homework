function getBackgroundColor(el: HTMLButtonElement | null): string {
    if (!el) return '';
    return window.getComputedStyle(el).backgroundColor || '';
}

document.addEventListener('DOMContentLoaded', () => {
    //@Task 1
    const btn:HTMLButtonElement | null = document.querySelector("#b1");

    if (btn && !btn.dataset.originalBg) {
        btn.dataset.originalBg = getBackgroundColor(btn);
    }

    btn?.addEventListener("mouseenter", () => {
        btn.style.backgroundColor = "yellow";
    });

    btn?.addEventListener("mouseleave", () => {
        btn.style.backgroundColor = btn.dataset.originalBg || '';
    });

    //@Task2
    const table = document.getElementById("myTable");
    if (!table) return;

    table.querySelectorAll("tr").forEach(row => {
        const originalBg = (row as HTMLTableRowElement).style.backgroundColor;
        row.addEventListener("mouseenter", () => {
            (row as HTMLTableRowElement).style.backgroundColor = "lightgreen";
        });
        row.addEventListener("mouseleave", () => {
            (row as HTMLTableRowElement).style.backgroundColor = originalBg;
        });
    });

    //@Task3
    const link = document.getElementById("link");
    const tooltip = document.getElementById("tooltip");
    if (!link || !tooltip) return;

    link.addEventListener("mouseenter", (e) => {
        tooltip.textContent = (link as HTMLAnchorElement).href;
        tooltip.style.display = "block";
        tooltip.style.left = e.pageX + "px";
        tooltip.style.top = e.pageY + "px";
    });

    link.addEventListener("mousemove", (e) => {
        tooltip.style.left = e.pageX + "px";
        tooltip.style.top = e.pageY + "px";
    });

    link.addEventListener("mouseleave", () => {
        setTimeout(() => {
            tooltip.style.display = "none";
        }, 300);
    });

    //@Task4
    const area = document.getElementById("contextArea");
    const menu = document.getElementById("menu");

    if (!area || !menu) throw new Error("Элементы не найдены");

    area.addEventListener("contextmenu", (e: MouseEvent) => {
        e.preventDefault();
        menu.style.display = "block";
        menu.style.left = e.pageX + "px";
        menu.style.top = e.pageY + "px";
    });

    document.addEventListener("click", () => {
        menu.style.display = "none";
    });

    menu.querySelectorAll("li").forEach(item => {
        const li = item as HTMLLIElement;
        li.addEventListener("mouseenter", () => {
            li.style.backgroundColor = "lightblue";
        });
        li.addEventListener("mouseleave", () => {
            li.style.backgroundColor = "";
        });
    });

    //@Task5
    const keys = document.querySelectorAll("#keyboard button");

    document.addEventListener("keydown", (e) => {
        keys.forEach(btn => {
            if ((btn as HTMLButtonElement).dataset.key?.toLowerCase() === e.key.toLowerCase()) {
                (btn as HTMLButtonElement).style.backgroundColor = "orange";
            }
        });
    });

    document.addEventListener("keyup", (e) => {
        keys.forEach(btn => {
            if ((btn as HTMLButtonElement).dataset.key?.toLowerCase() === e.key.toLowerCase()) {
                (btn as HTMLButtonElement).style.backgroundColor = "";
            }
        });
    });
});

