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
    console.log(inputBox)

})

//9. logout the items in inputBox array using for loop
for(let i = 0; i < inputBox.length; i++){
    // console.log(inputBox[i])
    //10. render the inputBox in unordered list
    //render the <li> elements
    ul.innerHTML += "<li>" + inputBox[i] + "</li>"
}
