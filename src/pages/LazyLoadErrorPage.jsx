import { Link } from 'react-router-dom'
import ErrorState from '../components/feedback/ErrorState'
import Button from '../components/ui/Button'

export default function LazyLoadErrorPage() {
  return (
    <div className="figma-admin-section flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <ErrorState
          title="Failed to load this page"
          message="The page module could not be loaded. Refresh the browser or try again later."
          onRetry={() => window.location.reload()}
        />
        <div className="mt-6 flex justify-center">
          <Link to="/dashboard">
            <Button type="button">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
