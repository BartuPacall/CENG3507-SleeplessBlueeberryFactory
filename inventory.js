document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll("article section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");

      sections.forEach((section) => {
        if (section.id === target) {
          section.classList.add("active");
        } else {
          section.classList.remove("active");
        }
      });
    });
  });

  // Initially show only the first tab content
  sections.forEach((section, index) => {
    if (index === 0) {
      section.classList.add("active");
    } else {
      section.classList.remove("active");
    }
  });
});
