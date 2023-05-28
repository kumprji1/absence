module.exports = (a, b) => {
    
  const dateA = a.toDate;
  const dateB = b.toDate;

  let comparison = 0;
  if (dateA > dateB) {
    comparison = 1;
  } else if (dateA < dateB) {
    comparison = -1;
  }
  return comparison;
}
