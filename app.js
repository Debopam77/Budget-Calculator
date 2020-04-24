/*----------------------------------
 To Do List :
 1. Adding the event handlers.
 2. Getting the input values.
 3. Add the new item to out data structure.
 4. Adding the new item to the UI.
 5. Calculating the budget and the percentages.
 6. Updating the calculated values to the UI
 Modules:
 1. Controller
 2. UI Module
 3. Data module
------------------------------------*/

var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;    
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage : -1
    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum = sum + curr.value;
        });
        data.totals[type] = sum;
    };
    return {
        addItem : function (type, des, val) {
            var newItem, ID;
            if (data.allItems[type].length === 0)
                ID = 0;
            else    
                ID = data.allItems[type][data.allItems[type].length -1].id + 1; //ID of the element in the last place + 1

            if(type === 'exp'){
                newItem = new Expense (ID, des, val);
            }else if(type == 'inc'){
                newItem = new Income (ID, des, val);
            }
            data.allItems[type].push(newItem); //allItems is treated as an array with exp[] & inc[] as its values, type just selects the array we want to use by name
            return newItem;
        },
        deleteItem : function(type, id){
            var ids, index;
            //to find and delete the item with this type and ID
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        getBudget(){
            return {
                budget : data.budget,
                totalIncome : data.totals.inc,
                totalExpense : data.totals.exp,
                percentage : data.percentage
            }
        },
        calculagePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages : function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;
        },
        calculateBudget : function() {
            //Calculate total income and total expense
            calculateTotal('exp');
            calculateTotal('inc');
            //Calculate the budget : total income - total expense
            data.budget = data.totals.inc - data.totals.exp ;
            //Calculate the percentage of the income already spent
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;    
        },
        testing : function (){
            console.log(data);
        }
    };

})();

var UIController = (function() {
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        incomeDisplay : '.budget__income--value',
        expenseDisplay : '.budget__expenses--value',
        expensePercentage : '.budget__expenses--percentage',
        incomePercentage : '.budget__income--percentage',
        budgetDisplay : '.budget__value',
        container : '.container',
        expensesPercLabel : '.item__percentage',
        monthLabel : '.budget__title--month'
    };
    var formatNumber = function(number, type){
        //Convert any number into ###,###.## format
        var sign, formatted, sec, index;
        formatted = Math.abs(number).toLocaleString();
        index = formatted.indexOf('.');
        if(index !== -1)
            sec = formatted.substr(index -1, formatted.length);
        else{
            sec = formatted.substr(formatted.length -1);
            index = formatted.length;
        }      
        sec = parseFloat(sec);
        sec = sec.toFixed(2);
        type === 'inc' ? sign = '+ ' : sign = '- ';
        return sign + formatted.substr(0, index -1) + sec + '  ';  
    };
    var nodeListForEach = function(list, callBack){
        for(var i = 0; i<list.length; i++){
            callBack(list[i], i);
        }
    };
    return {
        displayMonthName : function(){
            const today = new Date()
            var monthString = today.toLocaleString('default', { month: 'long' });
            var yearString = today.getFullYear();
            document.querySelector(DOMStrings.monthLabel).textContent = monthString+ ' '+ yearString;
        },
        getInput: function(){
            return {
                type : document.querySelector(DOMStrings.inputType).value, //inc for income exp for expense
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem : function(obj, type) {
            var html,newHTML,element;
            //Create HTML string with place holder text
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>' +
                '<div class="right clearfix"><div class="item__value">%item_value%</div><div class="item__delete"><button'+ 
                'class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if (type === 'exp'){
                
                element = DOMStrings.expenseContainer; 
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clear'+
                'fix"><div class="item__value">%item_value%</div><div class="item__percentage">21%</div><div class="item__delete"><button'+ 
                'class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }    
            //Replace placeholder text with the actual data
            newHTML = ((html.replace('%id', obj.id)).replace('%description%', obj.description)).replace('%item_value%', formatNumber(obj.value, type));
            //Insert the HTML in the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        deleteListItem : function(elementID){
            var element = document.getElementById(elementID);
            element.parentNode.removeChild(element);
        },
        clearFields : function() {
            document.querySelector(DOMStrings.inputDescription).value = '';
            document.querySelector(DOMStrings.inputValue).value = '';
            document.querySelector(DOMStrings.inputDescription).focus();
        },
        displayBudget : function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetDisplay).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeDisplay).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMStrings.expenseDisplay).textContent = formatNumber(obj.totalExpense, 'exp') ;
            if(obj.percentage > 0)
                document.querySelector(DOMStrings.expensePercentage).textContent = obj.percentage +' %';
            else
            document.querySelector(DOMStrings.expensePercentage).textContent = '--';        
        },
        displayPercentages : function(itemPercentages){
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            nodeListForEach(fields, function(current, index){
                if(itemPercentages[index]>0)
                    current.textContent = itemPercentages[index] + ' %';
                else
                    current.textContent = '--';    
            });
        },
        changeType : function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue
            );
            nodeListForEach(fields, function(curr){
                curr.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        getDomStrings : function() {
            return DOMStrings;
        }
    }
})();

var appController = (function(budgetCtrl, UICtrl) {
    var input, newItem;
    var DOM = UICtrl.getDomStrings();
    var setupEventListeners = function(){
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputDescription).focus();
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }
    var updateBudget = function(){
        //Calculate budget
        budgetCtrl.calculateBudget();
        //Return budget
        var budgetObject = budgetCtrl.getBudget();
        //display budget on the UI
        UICtrl.displayBudget(budgetObject);
    }
    var ctrlAddItem = function(){
        //Get the filled input data
        input = UIController.getInput();
        if(isNaN(input.value) || input.description === '' || input.value <= 0)
            return;
        //Add item to the budgetController
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        //Add the item to UI
        UICtrl.addListItem(newItem, input.type);
        UICtrl.clearFields();
        //Calculated the budget & update budget in the UI
        updateBudget();
        //Update the percentage tagged to each list item
        updatePercentages();

    };
    var ctrlDeleteItem = function(event){
        var id = event.target.parentNode.parentNode.parentNode.parentNode.id, splitID, type;
        if(id.includes('inc') || id.includes('exp')){
            //Delete element from UI
            UICtrl.deleteListItem(id);
            //Splitting for type and ID
            splitID = id.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            //Delete element from data
            budgetCtrl.deleteItem(type, id);

            //Recalculate & update the new budget in the UI
            updateBudget();
            //Update the percentage tagged to each list item
            updatePercentages();
        }
    };
    var updatePercentages = function(){
        //Calculate percentage
        budgetCtrl.calculagePercentages();
        //Read percentage from the budget controller
        var itemPercentages = budgetCtrl.getPercentages();
        //Update the UI with the percentages
        UICtrl.displayPercentages(itemPercentages);
    };
    return {
        init: function() {
            UICtrl.displayMonthName();
            UICtrl.displayBudget({
                budget : '0.0',
                totalExpense : 0,
                totalIncome : 0,
                percentage : -1
            });
            setupEventListeners();
            
        }
    };
})(budgetController, UIController);

appController.init();