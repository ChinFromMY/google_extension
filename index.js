//6 create empty array & get the input id
let inputBox = []
const inputEl = document.getElementById("input-el")

//10. grab the unordered list and store it in a const variable 
const ul = document.getElementById("ul-el")


// 5. logout button clicked when user clicks save input button
const inputButton = document.getElementById("btn")

//27 make delete btn functionable
const deleteBtn = document.getDocumentById("delete-btn")

deleteBtn.addEventListener("dblclick", function(){
    localStorage.clear()
    myUrl = []
    render()

})


//26
const urlFromLocalStorage = JSON.parse(localStorage.getItem("myUrl"))

if(urlFromLocalStorage){
    myUrl = urlFromLocalStorage
    render()
}


//24
inputButton.addEventListener("click", function(){
    // 5. console.log("Button clicked!")

    //7. push the user input de value to array and log it
    // inputBox.push("www.awesomelead.com")
    // console.log(inputBox)
    //8. get user input from input field
    inputBox.push(inputEl.value)

    //16. improvement 3:
    // ulEl.innerHTML += "<li>" + inputEl.value + "</li>"

    //14. clear the input field
    inputEl.value = ""

    //26 save to localStorage
    localStorage.setItem("myUrl", JSON.stringify(myUrl))

    //13
    render()

})


//13 wrap the code using render()
function render(){
    //12. create empty string to hold the list items
    let listItems = ""


    //9. logout the items in inputBox array using for loop
    for(let i = 0; i < inputBox.length; i++){
        // console.log(inputBox[i])
        //10. render the inputBox in unordered list
        //render the <li> elements
        // ul.innerHTML += "<li>" + inputBox[i] + "</li>"

        //12. improve the performance of app

        //17
        listItems += `
        <li> 
            <a target='_blank' href='${inputBox[i]}'>
            ${inputBox[i]} 
            </a>
        </li>`
    }
    ul.innerHTML = listItems
}

