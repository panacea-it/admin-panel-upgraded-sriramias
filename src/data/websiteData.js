const makeYoutubeRows = () =>
  Array.from({ length: 18 }, (_, i) => ({
    id: String(56565 + i),
    name: 'UPSC Preparation Youtube',
    url: 'www.upscpreaparationvideo.com',
    time: '10 AM',
    date: '14 May 2026',
    dateBucket: i < 6 ? 'Today' : i < 12 ? 'This Week' : 'This Month',
    status: i % 3 === 0 ? 'Draft' : 'Active',
  }))

const makeRankRows = () =>
  Array.from({ length: 18 }, (_, i) => ({
    id: String(56565 + i),
    name: 'Darshan Kotla',
    rank: 'AIR 4',
    imageUrl: null,
    time: '10 AM',
    date: '14 May 2026',
    dateBucket: i < 6 ? 'Today' : i < 12 ? 'This Week' : 'This Month',
  }))

const makeReviewRows = () =>
  Array.from({ length: 18 }, (_, i) => ({
    id: String(56565 + i),
    name: 'Darshan Kotla',
    mobile: '6300662566',
    rating: '4.5',
    review: 'Good',
    time: '10 AM',
    date: '14 May 2026',
    dateBucket: i < 6 ? 'Today' : i < 12 ? 'This Week' : 'This Month',
  }))

export const INITIAL_YOUTUBE_VIDEOS = makeYoutubeRows()
export const INITIAL_RANKERS = makeRankRows()
export const INITIAL_APP_REVIEWS = makeReviewRows()
