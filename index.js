//6 create empty array & get the input id
let inputBox = []
const inputEl = document.getElementById("input-el")


// 5. logout button clicked when user clicks save input button
const inputButton = document.getElementById("btn")


inputButton.addEventListener("click", function(){
    // 5. console.log("Button clicked!")

    //7. push the user input de value to array and log it
    // inputBox.push("www.awesomelead.com")
    // console.log(inputBox)
    inputBox.push(inputEl.value)
    console.log(inputBox)

})

