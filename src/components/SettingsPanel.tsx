import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Mic, Volume2, Clock, Target, Moon, Sun, Monitor } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState({
    // Audio Settings
    microphoneSensitivity: 0.7,
    autoGainControl: true,
    noiseSuppression: true,
    
    // Practice Settings
    defaultTimeLimit: 120,
    countdownDuration: 3,
    autoStartRecording: false,
    
    // Feedback Settings
    showRealTimeFeedback: true,
    detailedAnalysis: true,
    highlightFillerWords: true,
    
    // UI Settings
    theme: 'light',
    animations: true,
    compactMode: false
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings({
      microphoneSensitivity: 0.7,
      autoGainControl: true,
      noiseSuppression: true,
      defaultTimeLimit: 120,
      countdownDuration: 3,
      autoStartRecording: false,
      showRealTimeFeedback: true,
      detailedAnalysis: true,
      highlightFillerWords: true,
      theme: 'light',
      animations: true,
      compactMode: false
    });
  };

  const settingSections = [
    {
      title: 'Audio Settings',
      icon: Mic,
      settings: [
        {
          key: 'microphoneSensitivity',
          label: 'Microphone Sensitivity',
          type: 'range',
          min: 0.1,
          max: 1.0,
          step: 0.1,
          description: 'Adjust how sensitive your microphone is to sound'
        },
        {
          key: 'autoGainControl',
          label: 'Auto Gain Control',
          type: 'toggle',
          description: 'Automatically adjust microphone volume for optimal recording'
        },
        {
          key: 'noiseSuppression',
          label: 'Noise Suppression',
          type: 'toggle',
          description: 'Reduce background noise during recording'
        }
      ]
    },
    {
      title: 'Practice Settings',
      icon: Clock,
      settings: [
        {
          key: 'defaultTimeLimit',
          label: 'Default Time Limit',
          type: 'select',
          options: [
            { value: 60, label: '1 minute' },
            { value: 120, label: '2 minutes' },
            { value: 180, label: '3 minutes' },
            { value: 300, label: '5 minutes' }
          ],
          description: 'Default speaking time for practice sessions'
        },
        {
          key: 'countdownDuration',
          label: 'Countdown Duration',
          type: 'select',
          options: [
            { value: 3, label: '3 seconds' },
            { value: 5, label: '5 seconds' },
            { value: 10, label: '10 seconds' }
          ],
          description: 'Time to prepare before recording starts'
        },
        {
          key: 'autoStartRecording',
          label: 'Auto-start Recording',
          type: 'toggle',
          description: 'Automatically start recording after countdown'
        }
      ]
    },
    {
      title: 'Feedback Settings',
      icon: Target,
      settings: [
        {
          key: 'showRealTimeFeedback',
          label: 'Real-time Feedback',
          type: 'toggle',
          description: 'Show feedback while you\'re speaking'
        },
        {
          key: 'detailedAnalysis',
          label: 'Detailed Analysis',
          type: 'toggle',
          description: 'Provide comprehensive feedback after each session'
        },
        {
          key: 'highlightFillerWords',
          label: 'Highlight Filler Words',
          type: 'toggle',
          description: 'Mark filler words in your transcript'
        }
      ]
    },
    {
      title: 'Interface Settings',
      icon: Monitor,
      settings: [
        {
          key: 'theme',
          label: 'Theme',
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto (System)' }
          ],
          description: 'Choose your preferred color scheme'
        },
        {
          key: 'animations',
          label: 'Animations',
          type: 'toggle',
          description: 'Enable smooth animations and transitions'
        },
        {
          key: 'compactMode',
          label: 'Compact Mode',
          type: 'toggle',
          description: 'Use a more condensed layout'
        }
      ]
    }
  ];

  const renderSettingInput = (setting: any) => {
    const value = settings[setting.key as keyof typeof settings];

    switch (setting.type) {
      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => updateSetting(setting.key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        );

      case 'range':
        return (
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={value as number}
              onChange={(e) => updateSetting(setting.key, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
              {Math.round((value as number) * 100)}%
            </span>
          </div>
        );

      case 'select':
        return (
          <select
            value={value as string | number}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {setting.options.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Customize your speaking practice experience</p>
      </div>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Section Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
            </div>

            {/* Section Settings */}
            <div className="p-6 space-y-6">
              {section.settings.map((setting, settingIndex) => (
                <div key={setting.key} className="flex items-start justify-between">
                  <div className="flex-1 mr-6">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {setting.label}
                    </label>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center space-x-4"
      >
        <button
          onClick={resetToDefaults}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Reset to Defaults
        </button>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Save Settings
        </button>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Adjust microphone sensitivity based on your environment</li>
          <li>• Enable noise suppression for better audio quality</li>
          <li>• Use real-time feedback to improve while speaking</li>
          <li>• Choose a time limit that matches your speaking goals</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default SettingsPanel;
