import Course from '../models/Course.js'

function buildPriceFromForm(formData) {
  if (!formData) return null
  const offline = String(formData.offlineFees || '').trim()
  const online = String(formData.onlineFees || '').trim()
  if (offline && online) return `${offline} - ${online}`
  return offline || online || null
}

function buildListQuery(query) {
  const filter = {}
  const { search, category, status } = query

  if (category && category !== 'all') {
    filter.category = category
  }

  if (status && status !== 'all') {
    filter.status = status
  }

  if (search && String(search).trim()) {
    const q = String(search).trim()
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ courseName: regex }, { category: regex }, { center: regex }]
  }

  return filter
}

export async function getCourses(req, res, next) {
  try {
    const filter = buildListQuery(req.query)
    const courses = await Course.find(filter).sort({ createdAt: -1 }).lean()

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    })
  } catch (error) {
    next(error)
  }
}

export async function getCourseById(req, res, next) {
  try {
    const course = await Course.findById(req.params.id).lean()
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    res.json({ success: true, data: course })
  } catch (error) {
    next(error)
  }
}

export async function createCourse(req, res, next) {
  try {
    const { courseName, category, center, price, status, formData } = req.body
    const resolvedPrice = price?.trim() || buildPriceFromForm(formData) || '—'

    const course = await Course.create({
      courseName: courseName.trim(),
      category: category.trim(),
      center: center.trim(),
      price: resolvedPrice,
      status: status || 'Active',
      formData: formData || null,
    })

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateCourse(req, res, next) {
  try {
    const { courseName, category, center, price, status, formData } = req.body
    const resolvedPrice = price?.trim() || buildPriceFromForm(formData)

    const updates = {
      courseName: courseName?.trim(),
      category: category?.trim(),
      center: center?.trim(),
      status,
      formData: formData ?? undefined,
    }

    if (resolvedPrice) {
      updates.price = resolvedPrice
    } else if (price) {
      updates.price = String(price).trim()
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    )

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    res.json({
      success: true,
      message: 'Course deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
