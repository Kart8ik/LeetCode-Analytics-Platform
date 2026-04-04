import LoginNavbar from '@/components/LoginNavbar'
import ProfileEditorPanel from '@/components/ProfileEditorPanel'

export default function SetupProfile() {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <LoginNavbar />
      </div>
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <div className="w-full max-w-2xl">
          <ProfileEditorPanel
            mode="setup"
            title="Complete your profile"
            description="Choose a username and university to continue."
            submitLabel="Continue"
          />
        </div>
      </div>
    </div>
  )
}