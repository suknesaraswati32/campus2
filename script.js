function displayJobs(jobs){

const container = document.getElementById("jobsContainer");

container.innerHTML="";

jobs.slice(0,9).forEach(job=>{

let skillsHTML="";

job.requiredSkills.forEach(skill=>{
skillsHTML+=`<span class="badge bg-primary me-1">${skill}</span>`;
});

const card = document.createElement("div");

card.classList.add("col-md-4","mb-4");

card.innerHTML=`

<div class="card shadow jobCard h-100">

<img src="https://source.unsplash.com/400x300/?technology,office"
class="card-img-top">

<div class="card-body">

<h5 class="card-title">${job.jobTitle}</h5>

<p class="card-text">
<b>Location:</b> ${job.location}<br>
<b>Package:</b> ₹${job.package}
</p>

<div class="mb-2">
${skillsHTML}
</div>

<button class="btn btn-primary w-100"
onclick="applyJob('${job._id}')">
Apply Now
</button>

</div>

</div>

`;

container.appendChild(card);

});

}