//6 create empty array & get the input id
// let inputBox = []

const inputEl = document.getElementById("input-el")
const inputBtn = document.getElementById("input-btn")
const ulEl = document.getElementById("ul-el")
const deleteBtn = document.getElementById("delete-btn")
const tabBtn = document.getElementById("tab-btn")

// RAG features
const searchEl = document.getElementById("search-el")     //Input for RAG Search/Q&A
const searchBtn = document.getElementById("search-btn")   //Button to trigger RAG

const RAG_API_ENDPOINT = "https://fblbdlbqqloheiyatzqu.supabase.co/functions/v1/smart-function"

async function loadLeads(){
    try{
        const response = await fetch(`${RAG_API_ENDPOINT}/list`);
        const leads = await response.json();
        render(leads);
    }catch(error){
        console.error("Failed to load leads from API:", error);
        ulEl.innerHTML = '<li>Error loading bookmarks.</li>';
    }
}

// to display
function render(leads){
    let listItems = ""

    for(const lead of leads){
        const url = lead.url || lead;
        listItems += `
        <li>
            <a target='_blank' href='${url}'>
                ${url}
            </a>
        </li>
        `
    }
    ul.innerHTML = listItems
}

//save tab 
tabBtn.addEventListener("click", async function(){
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs){
        const urlToSave = tabs[0].url;
        try{
            const response = await fetch(`${RAG_API_ENDPOINT}/save`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({url: urlToSave})
            });
            const updatedLeads = await response.json();
            render(updatedLeads);
        } catch(error){
            console.error("Failed to save tab via API:", error);
        }
    })
})

// delete all, call API to clear database
deleteBtn.addEventListener("dblclick", async function(){
    if(!confirm("Are you sure you want to delete ALL bookmarks? This cannot be undo.")) return;
    try{
        await fetch(`${RAG_API_ENDPOINT}/clear`, {method: 'POST'});
    } catch(error){
        console.error("Failed to clear leads via API:", error);
    }
})



inputBtn.addEventListener("click", async function(){
    const urlToSave = inputEl.value;
    inputEl.value = "";
    if(!urlToSave) return;
    try{
        const response = await fetch(`${RAG_API_ENDPOINT}/save`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({url: urlToSave})
        });

        const updatedLeads = await response.json();
        render(updatedLeads);
    } catch(error){
        console.error("Failed to save input via API:", error);
    }
})

//Semantic Search/Q&A
searchBtn.addEventListener("click", async function(){
    const query = searchEl.value;
    if(!query) return;
    ulEl.innerHTML = '<li>Searching...</li>';

    try{
        //API handles embedding the query, searching the Supabase vector store and call LLM for summarization/Q&A
        const response = await fetch(`${RAG_API_ENDPOINT}/rag-query`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query: query})
        });

        const result = await response.json();

        let ragOutput = `<li><strong>RAG Answer:</strong> ${result.answer}</li>`;

        //display the retrieved context/source URLs
        ragOutput += `<li><strong>Retrieved Sources:</strong></li>`;
        for(const url of result.relevant_urls){
            ragOutput += `
                <li>
                    <a target='_blank' href='${url}'>
                        ${url}
                    </a>
                </li>
            `;
        }

        ulEl.innerHTML = ragOutput;

    } catch(error){
        console.error("RAG Query Failed:", error);
        ulEl.innerHTML = '<li>Error performing RAG query.</li>';
    }
});

loadLeads();



