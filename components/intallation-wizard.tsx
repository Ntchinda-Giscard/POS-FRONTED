import React, { useState } from "react";
import {
  CheckCircle,
  Circle,
  AlertCircle,
  Download,
  FileText,
  Shield,
  Settings,
} from "lucide-react";

const InstallationWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [installPath, setInstallPath] = useState(
    "C:\\Program Files\\MyElectronApp"
  );
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);
  const [createStartMenu, setCreateStartMenu] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installComplete, setInstallComplete] = useState(false);

  const steps = [
    { id: 0, name: "Welcome", icon: Download },
    { id: 1, name: "Installation Guide", icon: FileText },
    { id: 2, name: "Terms & Conditions", icon: Shield },
    { id: 3, name: "Configuration", icon: Settings },
    { id: 4, name: "Installation", icon: CheckCircle },
  ];

  const handleInstall = () => {
    setInstalling(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setInstallProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setInstallComplete(true);
        setInstalling(false);
      }
    }, 300);
  };

  const canProceed = () => {
    if (currentStep === 2 && !termsAccepted) return false;
    return true;
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <Icon size={24} />
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 mt-[-20px] transition-all ${
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const WelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
        <Download size={40} className="text-white" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800">
        Welcome to MyElectronApp
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Thank you for choosing MyElectronApp. This wizard will guide you through
        the installation process.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
        <h3 className="font-semibold text-blue-900 mb-2">What you'll get:</h3>
        <ul className="text-left text-blue-800 space-y-2">
          <li className="flex items-start">
            <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>Easy-to-use desktop application</span>
          </li>
          <li className="flex items-start">
            <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>Automatic updates and security patches</span>
          </li>
          <li className="flex items-start">
            <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>Cross-platform compatibility</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const GuideStep = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 text-center">
        Installation Guide
      </h2>
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">
              System Requirements
            </h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Operating System: Windows 10/11, macOS 10.13+, or Linux</li>
              <li>• RAM: Minimum 4GB (8GB recommended)</li>
              <li>• Disk Space: 500MB free space</li>
              <li>• Internet connection for activation</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">
              Before You Install
            </h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Close all running applications</li>
              <li>• Ensure you have administrator privileges</li>
              <li>• Disable antivirus temporarily if installation fails</li>
              <li>• Back up any previous version settings</li>
            </ul>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">
              Important Notes
            </h3>
            <ul className="text-gray-600 space-y-1">
              <li>
                • The installation process takes approximately 2-3 minutes
              </li>
              <li>• Your system may require a restart after installation</li>
              <li>• Default settings are recommended for most users</li>
              <li>• You can change installation path in the next steps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const TermsStep = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 text-center">
        Terms and Conditions
      </h2>
      <div className="bg-white border rounded-lg p-6 h-96 overflow-y-auto text-sm text-gray-700 space-y-4">
        <div>
          <h3 className="font-bold text-lg mb-2">
            End User License Agreement (EULA)
          </h3>
          <p>Last updated: September 30, 2025</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">1. License Grant</h4>
          <p>
            Subject to your compliance with these terms, we grant you a limited,
            non-exclusive, non-transferable license to install and use
            MyElectronApp on devices you own or control.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">2. Restrictions</h4>
          <p>You may not:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Reverse engineer, decompile, or disassemble the software</li>
            <li>Remove or modify any proprietary notices</li>
            <li>Use the software for any illegal purpose</li>
            <li>Distribute, rent, lease, or lend the software</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">3. Privacy and Data Collection</h4>
          <p>
            We collect anonymous usage data to improve our services. We do not
            sell your personal information. For full details, see our Privacy
            Policy.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">4. Updates</h4>
          <p>
            The software may automatically download and install updates. You can
            disable automatic updates in the application settings.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">5. Warranty Disclaimer</h4>
          <p>
            THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE
            DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
            MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">6. Limitation of Liability</h4>
          <p>
            IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
            SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR
            INABILITY TO USE THE SOFTWARE.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">7. Termination</h4>
          <p>
            This license is effective until terminated. Your rights will
            terminate automatically without notice if you fail to comply with
            any term of this agreement.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle
            className="text-yellow-600 mr-3 flex-shrink-0 mt-1"
            size={24}
          />
          <div>
            <p className="text-yellow-800 font-medium mb-2">
              Please read the terms carefully before accepting
            </p>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 mr-3 cursor-pointer"
              />
              <span className="text-gray-700">
                I have read and agree to the Terms and Conditions
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const ConfigStep = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 text-center">
        Installation Configuration
      </h2>

      <div className="bg-white border rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Installation Path
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={installPath}
              onChange={(e) => setInstallPath(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
              Browse
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Space required: 500 MB</p>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            Additional Options
          </h3>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={createDesktopShortcut}
                onChange={(e) => setCreateDesktopShortcut(e.target.checked)}
                className="w-5 h-5 mr-3 cursor-pointer"
              />
              <div>
                <span className="text-gray-700 font-medium">
                  Create desktop shortcut
                </span>
                <p className="text-sm text-gray-500">
                  Add a shortcut icon to your desktop
                </p>
              </div>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={createStartMenu}
                onChange={(e) => setCreateStartMenu(e.target.checked)}
                className="w-5 h-5 mr-3 cursor-pointer"
              />
              <div>
                <span className="text-gray-700 font-medium">
                  Add to Start Menu
                </span>
                <p className="text-sm text-gray-500">
                  Create Start Menu entry for easy access
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const InstallStep = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      {!installComplete ? (
        <>
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            {installing ? "Installing..." : "Ready to Install"}
          </h2>

          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Installation Progress</span>
                <span>{installProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${installProgress}%` }}
                />
              </div>
            </div>

            {installing && (
              <div className="text-center text-gray-600 animate-pulse">
                Installing MyElectronApp...
              </div>
            )}

            {!installing && installProgress === 0 && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Installation Path:</span>
                  <span className="font-medium">{installPath}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Desktop Shortcut:</span>
                  <span className="font-medium">
                    {createDesktopShortcut ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Menu:</span>
                  <span className="font-medium">
                    {createStartMenu ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!installing && installProgress === 0 && (
            <button
              onClick={handleInstall}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Install Now
            </button>
          )}
        </>
      ) : (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            Installation Complete!
          </h2>
          <p className="text-lg text-gray-600">
            MyElectronApp has been successfully installed on your computer.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-green-800">
              You can now launch the application from your desktop or Start
              Menu.
            </p>
          </div>
          <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors">
            Launch MyElectronApp
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <StepIndicator />

        <div className="mt-8 mb-8">
          {currentStep === 0 && <WelcomeStep />}
          {currentStep === 1 && <GuideStep />}
          {currentStep === 2 && <TermsStep />}
          {currentStep === 3 && <ConfigStep />}
          {currentStep === 4 && <InstallStep />}
        </div>

        {currentStep < 4 && (
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === 3 ? "Install" : "Next"}
            </button>
          </div>
        )}

        {installComplete && (
          <div className="flex justify-center pt-6 border-t">
            <button className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Finish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallationWizard;
