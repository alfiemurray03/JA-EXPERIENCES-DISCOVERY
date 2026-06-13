document.getElementById('year').textContent = new Date().getFullYear();

const setCurrentYear = () => {
  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = new Date().getFullYear();
};

setCurrentYear();
