import { SignUp } from '@clerk/clerk-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join Code Snippet Vault
          </h2>
          <p className="text-gray-600 mb-8">
            Create your account and start organizing your code snippets
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUp 
            routing="path" 
            path="/sign-up"
            redirectUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: {
                  backgroundColor: '#3b82f6',
                  '&:hover': {
                    backgroundColor: '#2563eb'
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}