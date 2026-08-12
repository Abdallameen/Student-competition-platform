export function generateBracket(students: any[], method: 'random' | 'ranked') {
  let orderedStudents = [...students]

  if (method === 'random') {
    for (let i = orderedStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[orderedStudents[i], orderedStudents[j]] = [orderedStudents[j], orderedStudents[i]]
    }
  } else {
    orderedStudents.sort((a, b) => b.personal_points - a.personal_points)
  }

  const matches = []
  const numMatches = Math.floor(orderedStudents.length / 2)
  
  for (let i = 0; i < numMatches; i++) {
    if (method === 'random') {
      matches.push({
        participant1: orderedStudents[i * 2],
        participant2: orderedStudents[i * 2 + 1]
      })
    } else {
      matches.push({
        participant1: orderedStudents[i],
        participant2: orderedStudents[orderedStudents.length - 1 - i]
      })
    }
  }

  if (orderedStudents.length % 2 !== 0) {
    const byeStudent = orderedStudents[Math.floor(orderedStudents.length / 2)]
    matches.push({
      participant1: byeStudent,
      participant2: null,
      isBye: true
    })
  }

  return matches
}
