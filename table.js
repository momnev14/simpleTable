class Table {
    constructor(config, data) {
        this.config = config
        this.dataFunc = data
        this.data = typeof (data) === "function" ? data(0, this.config.rows) : data
        this.table = document.createElement('table')
        this.table.classList.add('table')
        this.tableRows = null
        this.selectedRow = null
        this.page = 1
        this.start = 0
        this.end = this.config.rows
        this.pagerDiv = document.createElement('div')
        this.prevButton = document.createElement('button')
        this.prevButton.textContent = "<"
        this.prevButton.classList.add('button1')
        this.pagerText = document.createElement('span')
        this.pagerText.setAttribute('id', 'pagerText')
        this.pagerText.classList.add('button1')
        this.nextButton = document.createElement('button')
        this.nextButton.classList.add('button1')
        this.nextButton.textContent = ">"
        this.pagerText.textContent = `страница ${this.page}`
        this.lastPage = null
        this.className = this.config.selectedRowClass
        this.endStart = null
        this.endEnd = null
        this.tableFormat = {
            num: (n) => n.toFixed(2),
            int: (n) => n.toFixed(0),
            data: (n) => `${n} г.`
        }
    }

    createTable() {
        let tableHeaders = this.createTableHeaders(this.config.columns)
        if (this.config.onselect) {
            this.initSelect(this.table)
        }
        this.table.appendChild(tableHeaders)
        this.fillTable()
    }

    fillTable(start = 0, end = this.config.rows) {
        let row
        for (let index = start; index < end; index++) {

            if (index >= this.data.length) {
                row = this.createEmptyRow(this.config.columns, this.data[index])
            } else {
                row = this.createRow(this.config.columns, this.data[index])
            }
            this.table.appendChild(row)
        }
        document.getElementById('container').appendChild(this.table)
    }

    createTableHeaders(columns) {
        let row = document.createElement('tr')
        row.classList.add('header')
        if (this.config.showHeader) {
            for (const column of columns) {
                let tableHeader = document.createElement('th')
                let text = document.createTextNode(column.name)
                tableHeader.appendChild(text)
                tableHeader.setAttribute("class", column.headerClass)
                row.appendChild(tableHeader)
            }
        }
        return row
    }

    createRow(columns, data) {
        let row = document.createElement('tr')
        for (const column of columns) {
            let tableData = document.createElement('td')
            let value = data[column.property]
            if (column.textFn) {
                value = column.textFn(value)
            }
            if (column.valueClass) {
                let a = column.valueClass(value)
                tableData.classList.add(column.cellClass, a)
            } else {
                tableData.setAttribute('class', column.cellClass)
            }

            if (!this.tableFormat[column.format]) {
                if (this.config.format[column.format]) {
                    let format = this.config.format[column.format]
                    value = format(value)
                }
            } else {
                if (this.tableFormat[column.format]) {
                    let format = this.config.format[column.format]
                    value = format(value)
                }
            }
            let text = document.createTextNode(value)
            tableData.appendChild(text)
            row.appendChild(tableData)
        }
        return row
    }

    createEmptyRow(columns) {
        let row = document.createElement('tr')
        for (const column of columns) {
            let tableData = document.createElement('td')
            row.appendChild(tableData)
        }
        return row
    }

    arrowAction(e) {
        switch (e.key) {
            case "ArrowUp":
                if (this.selectedRow !== null) {
                    this.selectedRow.classList.remove(this.config.selectedRowClass)
                }
                this.selectedRow = this.selectedRow.previousSibling
                this.selectedRow.classList.add(this.config.selectedRowClass)
                this.config.onselect(this.selectedRow)
                break;
            case "ArrowDown":
                if (this.selectedRow !== null) {
                    this.selectedRow.classList.remove(this.config.selectedRowClass)
                }
                this.selectedRow = this.selectedRow.nextSibling
                this.selectedRow.classList.add(this.config.selectedRowClass)
                this.config.onselect(this.selectedRow)
                break;
            case "PageUp":
                this.refillPrev()
                break;
            case "PageDown":
                this.refillNext()
                break;
            case 'Home':
                while (this.table.firstChild.nextSibling) {
                    this.table.removeChild(this.table.firstChild.nextSibling)
                }
                this.start = 0
                this.end = this.config.rows
                this.fillTable(this.start, this.end)
                this.page = 1
                this.pagerText.textContent = `страница ${this.page}`
                break;
            case 'End':
                while (this.table.firstChild.nextSibling) {
                    this.table.removeChild(this.table.firstChild.nextSibling)
                }
                this.start = this.endStart
                this.end = this.endEnd
                this.fillTable(this.start, this.end)
                this.pagerText.textContent = `страница ${this.lastPage}`
                break;
        }
    }

    initSelect(table) {
        table.addEventListener('click', (e) => {
            if (this.selectedRow !== null) {
                this.selectedRow.classList.remove(this.className)
            }
            this.selectedRow = e.target.parentNode
            this.selectedRow.classList.add(this.className)
            this.config.onselect(this.selectedRow)

        })
        window.addEventListener('keydown', this.arrowAction.bind(this))
    }

    checkDisabled() {
        if (this.page === 1) {
            this.prevButton.disabled = true
        } else {
            this.prevButton.disabled = false
        }
    }

    refillPrev() {
        if (this.start <= 0) {
            return
        }

        if (this.page === 1) {
            this.prevButton.disabled = true
        } else {
            this.prevButton.disabled = false
        }

        while (this.table.firstChild.nextSibling) {
            this.table.removeChild(this.table.firstChild.nextSibling)
        }
        if (this.start - this.config.rows < 0) {
            this.start = 0
            this.end = this.config.rows
        } else {
            this.start = this.start - this.config.rows
            this.end = this.end - this.config.rows
        }
        if (typeof this.dataFunc === "function") {
            this.data = this.dataFunc(this.start, this.end)
        } else { this.data = this.data }
        this.fillTable(this.start, this.end)
        this.page--
        this.pagerText.textContent = `страница ${this.page}`

    }

    refillNext() {
        if (typeof this.dataFunc === "function") {
            while (this.table.firstChild.nextSibling) {
                this.table.removeChild(this.table.firstChild.nextSibling)
            }

            this.start += this.config.rows
            this.end += this.config.rows

            this.data = this.dataFunc(this.start, this.end)

        } else {
            if (this.data.length <= this.end) {
                this.lastPage = this.page
                this.endEnd = this.end
                this.endStart = this.start
                return
            }
            if (this.page === this.lastPage) {
                this.nextButton.disabled = true
            } else {
                this.nextButton.disabled = false
            }
            while (this.table.firstChild.nextSibling) {
                this.table.removeChild(this.table.firstChild.nextSibling)
            }
            this.start += this.config.rows
            this.end += this.config.rows
        }

        this.fillTable(this.start, this.end)
        this.page++
        this.pagerText.textContent = `страница ${this.page}`
    }

    pager() {
        this.prevButton.addEventListener('click', this.refillPrev.bind(this))
        this.nextButton.addEventListener('click', this.refillNext.bind(this))
        this.pagerDiv.appendChild(this.pagerText)
        this.pagerDiv.appendChild(this.prevButton)
        this.pagerDiv.appendChild(this.nextButton)
        document.body.appendChild(this.pagerDiv)
    }
}
let format = {
    num: (n) => n.toFixed(2),
    int: (n) => n.toFixed(0),
    bgn: (n) => `${n.toFixed(2)} лв.`,
    data: (n) => `${n} г.`
}
let tableConfig = {
    columns: [{
        property: 'first-name',
        name: 'Име',
        headerClass: 'bold',
        cellClass: 'left',

    },
    {
        property: 'last-name',
        name: 'Фамилия',

        headerClass: 'bold',
        cellClass: 'left',

    },
    {
        property: 'age',
        name: 'Възраст',
        headerClass: 'bold',
        cellClass: 'right',

    },
    {
        property: 'city',
        name: 'Град',
        headerClass: 'bold',
        cellClass: 'left',

    },
    {
        property: 'payment',
        name: 'Възнаграждение',
        format: 'bgn',
        headerClass: 'bold',
        cellClass: 'left',
        valueClass: (value) => value < 1000 ? 'red' : undefined,
    },
    {
        property: 'has-certificate',
        name: 'Серфрикат',
        headerClass: 'bold',
        cellClass: 'left',
        textFn: (value) => value ? 'да' : 'не'
    },

    ],
    showHeader: true,
    rows: 5,
    canSelect: true,
    selectedRowClass: 'selected-row',
    onselect: (data) => console.log(`Selected ${data.textContent}!`),
    format
}


let data = [{
    "first-name": "Станчо",
    "last-name": "Станков",
    "age": "43",
    "city": "София",
    "payment": 4000,
    "has-certificate": "да"
},
{
    'first-name': "Петър",
    'last-name': "Петров",
    'age': '43',
    "city": "София",
    "payment": 4000,
    "has-certificate": ""
},
{
    "first-name": "Иван",
    'last-name': "Иванов",
    'age': "32",
    "city": "София",
    "payment": 4000,
    "has-certificate": "да"
},

{
    "first-name": "Станимир",
    "last-name": "Станимиров",
    "age": "33",
    "city": "Пловдив",
    "payment": 3600,
    "has-certificate": "да"
},
{
    "first-name": "Милен",
    "last-name": "Иванов",
    "age": "28",
    "city": "Пловдив",
    "payment": 3600,
    "has-certificate": "да"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Горна Оряховица",
    "payment": 780,
    "has-certificate": "не"
},
{
    "first-name": "Янко",
    "last-name": "Паскалиев",
    "age": "33",
    "city": "Гоце Делчев",
    "payment": 699.99,
    "has-certificate": "не"
},



{
    "first-name": "Пенка",
    "last-name": "Пенкова",
    "age": "33",
    "city": "Пловдив",
    "payment": 3600,
    "has-certificate": "да"
},
{
    "first-name": "Станимирa",
    "last-name": "Станимировa",
    "age": "33",
    "city": "Пловдив",
    "payment": 3600,
    "has-certificate": "да"
},
{
    "first-name": "Иван",
    "last-name": "Йорданов",
    "age": "31",
    "city": "Стара Загора",
    "payment": 1200,
    "has-certificate": "да"
},
{
    "first-name": "Йордан",
    "last-name": "Иванов",
    "age": "21",
    "city": "Варна",
    "payment": 800,
    "has-certificate": "не"
},
{
    "first-name": "Бойко",
    "last-name": "Бойчев",
    "age": "19",
    "city": "Русе",
    "payment": 780,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
}, {
    "first-name": "Васил",
    "last-name": "Василев",
    "age": "25",
    "city": "Стара Загора",
    "payment": 2100,
    "has-certificate": "да"
}

]

var users = [{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
},
{
    "first-name": "Георги",
    "last-name": "Георгиев",
    "age": "33",
    "city": "Дряново",
    "payment": 700,
    "has-certificate": "не"
}, {
    "first-name": "Васил",
    "last-name": "Василев",
    "age": "25",
    "city": "Стара Загора",
    "payment": 2100,
    "has-certificate": "да"
}]
function dataFunc(pos, count) {
    return users.slice(pos, pos + count)
}

let newTable = new Table(tableConfig, data)
newTable.createTable()
newTable.pager()
console.log(newTable.data)
