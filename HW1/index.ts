// отбрасывает дробную часть (в сторону 0)
function myTrunc(x: number): number {
    return x - (x % 1);
}

// Абсолютное значение
function myAbs(x: number): number {
    return x < 0 ? -x : x;
}

// Добавить ведущий ноль для двух знаков
function pad2(n: number): string {
    n = myTrunc(n);
    return n < 10 ? "0" + n : String(n);
}

// ------------------ @Task1 ------------------

// Task1.1
function filesOnFlash(gb: number, use1024: boolean = true): number {
    const mbPerGb = use1024 ? 1024 : 1000;
    const fileSizeMb = 820;
    const totalMb = gb * mbPerGb;
    return myTrunc(totalMb / fileSizeMb);
}
console.log("// Task1.1");
console.log("filesOnFlash(65) =>", filesOnFlash(65));

// Task1.2
function reverseThreeDigitNumber(n: number): number | null {
    if (isNaN(n)) return null;
    const sign = n < 0 ? -1 : 1;
    n = myAbs(n);
    n = myTrunc(n);
    if (n < 100 || n > 999) return null;
    const hundreds = myTrunc(n / 100);
    const tens = myTrunc((n % 100) / 10);
    const ones = n % 10;
    return sign * (ones * 100 + tens * 10 + hundreds);
}
console.log("// Task1.2");
console.log("reverseThreeDigitNumber(123) =>", reverseThreeDigitNumber(123));
console.log("reverseThreeDigitNumber(-405) =>", reverseThreeDigitNumber(-405));

// Task1.3
function evenOrOddNoIf(n: number): string {
    if (isNaN(n)) return "Неверный ввод";
    return (n % 2 === 0) && "Четное" || "Нечетное";
}
console.log("// Task1.3");
console.log("evenOrOddNoIf(8) =>", evenOrOddNoIf(8));
console.log("evenOrOddNoIf(7) =>", evenOrOddNoIf(7));

// ------------------ @Task2 ------------------

// Task2.1
function ageCategory(age: number): string {
    age = myTrunc(age);
    if (age < 0) return "Неверный возраст";
    if (age <= 12) return "Ребёнок (0-12)";
    if (age <= 17) return "Подросток (13-17)";
    if (age <= 59) return "Взрослый (18-59)";
    return "Пенсионер (60+)";
}
console.log("// Task2.1");
console.log("ageCategory(5) =>", ageCategory(5));
console.log("ageCategory(16) =>", ageCategory(16));
console.log("ageCategory(30) =>", ageCategory(30));
console.log("ageCategory(70) =>", ageCategory(70));

// Task2.2
function symbolForDigit(d: number): string {
    d = myTrunc(d);
    if (d < 0 || d > 9) return "Неверный ввод";
    const symbols = [')','!','@','#','$','%','^','&','*','('];
    return symbols[d];
}
console.log("// Task2.2");
console.log("symbolForDigit(1) =>", symbolForDigit(1));
console.log("symbolForDigit(0) =>", symbolForDigit(0));
console.log("symbolForDigit(9) =>", symbolForDigit(9));

// Task2.3
function isLeapYear(year: number): boolean {
    year = myTrunc(year);
    return (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);
}
console.log("// Task2.3");
console.log("isLeapYear(2020) =>", isLeapYear(2020));
console.log("isLeapYear(1900) =>", isLeapYear(1900));
console.log("isLeapYear(2000) =>", isLeapYear(2000));

// ------------------ @Task3 ------------------

// Task3.1
function statsFromArray(arr: number[]): {positives: number, negatives: number, zeros: number, evens: number, odds: number} | null {
    if (!Array.isArray(arr)) return null;
    let positives = 0, negatives = 0, zeros = 0, evens = 0, odds = 0;
    for (let i = 0; i < arr.length && i < 10; i++) {
        const val = myTrunc(arr[i]);
        if (val > 0) positives++;
        else if (val < 0) negatives++;
        else zeros++;

        if (val % 2 === 0) evens++;
        else odds++;
    }
    return {positives, negatives, zeros, evens, odds};
}
console.log("// Task3.1");
console.log("statsFromArray([1,-2,0,3,4,-5,6,0,9,-1]) =>", statsFromArray([1,-2,0,3,4,-5,6,0,9,-1]));

// Task3.2
function runCalculator(ops: {a: number, b: number, op: string}[]): (number | string)[] {
    const results: (number | string)[] = [];
    for (const item of ops) {
        const a = item.a;
        const b = item.b;
        const op = item.op;
        let res: number | string;
        if (op === "+") res = a + b;
        else if (op === "-") res = a - b;
        else if (op === "*") res = a * b;
        else if (op === "/") res = b === 0 ? "Ошибка: деление на 0" : a / b;
        else res = "Неизвестный оператор";
        results.push(res);
    }
    return results;
}
console.log("// Task3.2");
console.log("runCalculator([{a:2,b:3,op:'+'},{a:5,b:0,op:'/'}]) =>", runCalculator([{a:2,b:3,op:'+'},{a:5,b:0,op:'/'}]));

// ------------------ @Task4 ------------------

// Task4.1
function compare(a: number, b: number): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}
console.log("// Task4.1");
console.log("compare(2,5) =>", compare(2,5));
console.log("compare(5,2) =>", compare(5,2));
console.log("compare(3,3) =>", compare(3,3));

// Task4.2
function factorial(n: number): number | null {
    n = myTrunc(n);
    if (n < 0) return null;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1)!;
}
console.log("// Task4.2");
console.log("factorial(5) =>", factorial(5));

// Task4.3
function timeToSeconds(hours: number, minutes: number, seconds: number): number {
    return myTrunc(hours) * 3600 + myTrunc(minutes) * 60 + myTrunc(seconds);
}
console.log("// Task4.3");
console.log("timeToSeconds(1,2,3) =>", timeToSeconds(1,2,3));

// Task4.4
function secondsToHHMMSS(totalSeconds: number): string {
    totalSeconds = myTrunc(totalSeconds);
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = myTrunc(totalSeconds / 3600);
    const minutes = myTrunc((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return pad2(hours) + ":" + pad2(minutes) + ":" + pad2(seconds);
}
console.log("// Task4.4");
console.log("secondsToHHMMSS(3723) =>", secondsToHHMMSS(3723));

// Task4.5
function sumAll(...args: number[]): number {
    let s = 0;
    for (const v of args) s += v;
    return s;
}
console.log("// Task4.5");
console.log("sumAll(1,2,3,4) =>", sumAll(1,2,3,4));
