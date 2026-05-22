import { useCallback, useState } from 'react'
import { INITIAL_BATCHES, nextEnrollmentId, nextStudentId } from '../data/batchManagementData'

function buildInitialStudentsMap() {
  const map = {}
  for (const batch of INITIAL_BATCHES) {
    map[batch.id] = batch.students
    if (batch.batchId) map[batch.batchId] = batch.students
  }
  return map
}

export function useBatchStudents() {
  const [studentsByBatchId, setStudentsByBatchId] = useState(buildInitialStudentsMap)

  const getStudents = useCallback(
    (batchKey) => studentsByBatchId[batchKey] ?? [],
    [studentsByBatchId],
  )

  const updateStudents = useCallback((batchKey, updater) => {
    setStudentsByBatchId((prev) => {
      const current = prev[batchKey] ?? []
      const next = typeof updater === 'function' ? updater(current) : updater
      return { ...prev, [batchKey]: next }
    })
  }, [])

  const addStudent = useCallback(
    (batchKey, form) => {
      const allStudents = Object.values(studentsByBatchId).flat()
      const student = {
        id: nextStudentId(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        enrollmentId: form.enrollmentId || nextEnrollmentId([{ students: allStudents }]),
        paymentStatus: form.paymentStatus,
        attendance: Number(form.attendance) || 0,
        progress: Number(form.progress) || 0,
        status: 'Active',
      }
      updateStudents(batchKey, (students) => [...students, student])
      return student
    },
    [studentsByBatchId, updateStudents],
  )

  const updateStudent = useCallback(
    (batchKey, studentId, form) => {
      updateStudents(batchKey, (students) =>
        students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                paymentStatus: form.paymentStatus,
                attendance: Number(form.attendance) || 0,
                progress: Number(form.progress) || 0,
              }
            : s,
        ),
      )
    },
    [updateStudents],
  )

  const deleteStudent = useCallback(
    (batchKey, studentId) => {
      updateStudents(batchKey, (students) => students.filter((s) => s.id !== studentId))
    },
    [updateStudents],
  )

  const toggleStudentStatus = useCallback(
    (batchKey, studentId) => {
      updateStudents(batchKey, (students) =>
        students.map((s) =>
          s.id === studentId
            ? { ...s, status: s.status === 'Active' ? 'In Active' : 'Active' }
            : s,
        ),
      )
    },
    [updateStudents],
  )

  return {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
  }
}
