//6 create empty array & get the input id
let inputBox = []
const inputEl = document.getElementById("input-el")

//10. grab the unordered list and store it in a const variable 
const ul = document.getElementById("ul-el")


// 5. logout button clicked when user clicks save input button
const inputButton = document.getElementById("btn")


inputButton.addEventListener("click", function(){
    // 5. console.log("Button clicked!")

    //7. push the user input de value to array and log it
    // inputBox.push("www.awesomelead.com")
    // console.log(inputBox)
    //8. get user input from input field
    inputBox.push(inputEl.value)

    //16. improvement 3:
    ulEl.innerHTML += "<li>" + inputEl.value + "</li>"

    //14. clear the input field
    inputEl.value = ""

    //13
    // render()

})


// //13 wrap the code using render()
// function render(){
//     //12. create empty string to hold the list items
//     let listItems = ""


//     //9. logout the items in inputBox array using for loop
//     for(let i = 0; i < inputBox.length; i++){
//         // console.log(inputBox[i])
//         //10. render the inputBox in unordered list
//         //render the <li> elements
//         // ul.innerHTML += "<li>" + inputBox[i] + "</li>"

//         //12. improve the performance of app
//         listItems += "<li>" + inputBox[i] + "</li>"
//     }

//     //12
//     ul.innerHTML = listItems

// }

