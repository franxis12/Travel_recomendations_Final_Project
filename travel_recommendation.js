document.getElementById("searchForm").addEventListener("submit", function (e){
    e.preventDefault();

    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    const resultsDiv = document.getElementById("results");

    fetch("./travel_recommendation_api.json")
    .then(res => res.json())
    .then(data => {
        resultsDiv.innerHTML = "";

        let resultToShow = [];

        if(keyword.includes("beach")){
            resultToShow = data.beaches;
        } else if (keyword.includes("temple")){
            resultToShow = data.temples;
        } else if (keyword.includes("country") || keyword.includes("countries")) {
            data.countries.forEach(country => {
                resultToShow.push(...country.cities);    
            });
        } else {
            resultsDiv.innerHTML = "<p> No matches found.</p>";
            return;
        }

        resultToShow.forEach(place => {
            const card = document.createElement("div");
            card.classList.add("cardContent");
            card.innerHTML = `
            <h2 class="cardTitle">${place.name}</h2>
            <img src="${place.imageUrl}" alt="${place.name}" class="cardImg">
            <p>${place.description}</p>
            <button class="cardBtn btnSearch">Visit</button>

            
            `;
            
            resultsDiv.appendChild(card);

        });
    })
    .catch(err => {
        resultsDiv.innerHTML = "<p>Error loading data.</p>";
        console.error(err);
    })
})

document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("results").innerHTML = "";
});


const formss = document.getElementById("formContact");
if (formss) {
  formss.addEventListener("submit", function (e) {
    e.preventDefault();


    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if(name != "" && email != "" && message != "") {
        const form = document.getElementById("formContact");
        const header = document.getElementById("headerContactForm");
        const ul = document.createElement("ul");
        const liName = document.createElement("li");
        const liEmail = document.createElement("li");
        const liMessage = document.createElement("li"); 
        const customnMessage = document.createElement("p");

        liName.textContent = name;
        liEmail.textContent = email;
        liMessage.textContent = message;
        form.style.display = "none";

        customnMessage.innerHTML = `<h3>${name}, your message was sent successfully. 
        As soon as we review it, we'll contact you via email at(${email}).</h3>`;
        
        customnMessage.style.color = "green";
        customnMessage.style.fontSize = "20px";
        customnMessage.style.fontWeight = "bold";
        customnMessage.style.textAlign = "center";
        customnMessage.style.marginTop = "20px";
        customnMessage.style.marginBottom = "20px";
        customnMessage.style.padding = "10px";
        customnMessage.style.border = "2px solid green";
        customnMessage.style.borderRadius = "10px";
        customnMessage.style.backgroundColor = "lightgreen";
        customnMessage.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
        customnMessage.style.width = "80%";
        customnMessage.style.marginLeft = "auto";
        customnMessage.style.marginRight = "auto";
        customnMessage.style.display = "block";
        customnMessage.style.position = "relative";
        customnMessage.style.top = "0";
        customnMessage.style.left = "0";
        customnMessage.style.zIndex = "1";
        customnMessage.style.transition = "all 0.3s ease-in-out";
        customnMessage.style.opacity = "1";
        customnMessage.style.transform = "translateY(0)";
        customnMessage.style.animation = "fadeIn 0.5s ease-in-out";
        customnMessage.style.animationFillMode = "forwards";
        customnMessage.style.animationDelay = "0.5s";
      

        ul.appendChild(liName);
        ul.appendChild(liEmail);
        ul.appendChild(liMessage);
        header.appendChild(ul);
        header.appendChild(customnMessage)
    } else {
        alert("Please complete all field");
    }
  });
}