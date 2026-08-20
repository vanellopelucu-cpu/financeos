import { motion, type Variants } from 'framer-motion'
import { useState } from 'react'
import {
  Bell,
  CalendarDays,
  CheckCircle,
  Database,
  Download,
  Globe,
  Moon,
  Save,
  Settings as SettingsIcon,
  Shield,
  Sun,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { useTheme } from '../app/providers/ThemeContext'
import { useWorkspace } from '../app/providers/WorkspaceContext'
import { useAuth } from '../app/providers/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/utils'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function Profile() {
  const { user, updateUser, uploadAvatar } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const displayName = user?.user_metadata?.display_name || ''
  const email = user?.email || 'user@example.com'
  const avatarUrl = user?.user_metadata?.avatar_url || ''

  const [name, setName] = useState(displayName)
  const [photo, setPhoto] = useState(avatarUrl)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.')
      return
    }

    setError(null)
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    let avatarUrlResult = photo
    if (photoFile) {
      const uploadResult = await uploadAvatar(photoFile)
      if (uploadResult.error) {
        setError(uploadResult.error)
        setSaving(false)
        return
      }
      avatarUrlResult = uploadResult.url || photo
      setPhoto(avatarUrlResult)
    }

    const result = await updateUser({
      data: {
        display_name: name.trim(),
        avatar_url: avatarUrlResult,
      },
    })

    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
    setPhotoFile(null)
    setPreview(null)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <User size={16} />
            </div>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Profile
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            <motion.div
              variants={cardVariants}
              className="flex flex-shrink-0 flex-col items-center gap-3"
            >
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-workspace to-workspace-hover text-4xl text-white shadow-xl overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : photo ? (
                  <img src={photo} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-border'
                  )}
                >
                  <Upload size={16} />
                  Change Photo
                </motion.div>
              </label>
            </motion.div>

            <div className="flex-1 space-y-4 w-full">
              <motion.div variants={cardVariants}>
                <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Display Name
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    'mt-1 w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                  )}
                  placeholder="Enter your name"
                />
              </motion.div>

              <motion.div variants={cardVariants}>
                <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Email
                </p>
                <p className="mt-1 text-xl font-semibold text-text">
                  {email}
                </p>
              </motion.div>

              <motion.div variants={cardVariants}>
                <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Workspace
                </p>
                <p className="mt-1 text-xl font-semibold text-text">
                  {currentWorkspace.name} • {currentWorkspace.currency.symbol}
                </p>
              </motion.div>

              <motion.div variants={cardVariants}>
                <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Member Since
                </p>
                <p className="mt-1 text-xl font-semibold text-text">
                  {user?.user_metadata?.created_at
                    ? new Date(user.user_metadata.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'January 15, 2024'}
                </p>
              </motion.div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              {saved && (
                <p className="text-sm text-green-500">Saved!</p>
              )}

              <motion.div variants={cardVariants} className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving || (!name.trim() && !photoFile)}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50'
                  )}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function Appearance() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { id: 'light', name: 'Light Mode', icon: Sun },
    { id: 'dark', name: 'Dark Mode', icon: Moon },
    { id: 'system', name: 'System Mode', icon: Globe },
  ]

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Sun size={16} />
            </div>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Appearance
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {themes.map((t) => {
              const Icon = t.icon
              const isSelected = theme === t.id
              return (
                <motion.div
                  key={t.id}
                  variants={cardVariants}
                  whileHover={{ x: 4 }}
                  onClick={() => setTheme(t.id as 'light' | 'dark')}
                  className={cn(
                    'flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all',
                    isSelected
                      ? 'border-workspace bg-workspace/5'
                      : 'border-border/50 bg-secondary/50 hover:border-workspace/30'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      isSelected
                        ? 'bg-workspace text-white'
                        : 'bg-secondary text-text-tertiary'
                    )}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text">{t.name}</p>
                    <p className="text-sm text-text-secondary">
                      {t.id === 'light'
                        ? 'Clean white interface with subtle shadows'
                        : t.id === 'dark'
                          ? 'Premium dark interface with glass cards'
                          : 'Follows your system preference'}
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-workspace text-white"
                    >
                      <CheckCircle size={14} />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function WorkspaceSelector() {
  const { currentWorkspace, workspaces, setWorkspace } = useWorkspace()

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Globe size={16} />
            </div>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Workspace
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {workspaces.map((ws) => {
              const isSelected = currentWorkspace.id === ws.id
              const flag = ws.id === 'srilanka' ? '🇱🇰' : '🇮🇩'
              return (
                <motion.div
                  key={ws.id}
                  variants={cardVariants}
                  whileHover={{ x: 4 }}
                  onClick={() => setWorkspace(ws.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all',
                    isSelected
                      ? 'border-workspace bg-workspace/5'
                      : 'border-border/50 bg-secondary/50 hover:border-workspace/30'
                  )}
                >
                  <div className="text-2xl">{flag}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text">{ws.name}</p>
                      <Badge
                        variant={
                          ws.theme === 'green' ? 'success' : 'secondary'
                        }
                        size="sm"
                      >
                        {ws.theme === 'green' ? 'Green' : 'Blue'}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {ws.currency.name} ({ws.currency.symbol})
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-workspace text-white"
                    >
                      <CheckCircle size={14} />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CurrencyRegion() {
  const { currentWorkspace } = useWorkspace()
  const { currency } = currentWorkspace

  const locale = currency.code === 'LKR' ? 'en-LK' : 'id-ID'
  const dateFormats = {
    LKR: 'DD / MM / YYYY',
    IDR: 'DD / MM / YYYY',
  }
  const numberFormats = {
    LKR: '1,000,000.00',
    IDR: '1.000.000,00',
  }

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Globe size={16} />
            </div>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Currency & Region
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            <motion.div variants={cardVariants}>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Current Currency
              </p>
              <p className="mt-1 text-xl font-semibold text-text">
                {currency.symbol} ({currency.code})
              </p>
            </motion.div>

            <motion.div variants={cardVariants}>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Locale
              </p>
              <p className="mt-1 text-xl font-semibold text-text">
                {currency.name} ({locale})
              </p>
            </motion.div>

            <motion.div variants={cardVariants}>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Date Format
              </p>
              <p className="mt-1 text-xl font-semibold text-text">
                {dateFormats[currency.code as keyof typeof dateFormats]}
              </p>
            </motion.div>

            <motion.div variants={cardVariants}>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Number Format
              </p>
              <p className="mt-1 text-xl font-semibold text-text">
                {numberFormats[currency.code as keyof typeof numberFormats]}
              </p>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function Notifications() {
  const [notifications, setNotifications] = useState({
    billReminders: true,
    lowBalanceAlerts: true,
    weeklySummary: true,
    monthlyReport: true,
    aiTips: true,
  })

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const notificationItems = [
    { key: 'billReminders', name: 'Bill Reminders', desc: 'Notify before bills are due' },
    { key: 'lowBalanceAlerts', name: 'Low Balance Alerts', desc: 'Alert when balance is low' },
    { key: 'weeklySummary', name: 'Weekly Financial Summary', desc: 'Weekly spending overview' },
    { key: 'monthlyReport', name: 'Monthly Report', desc: 'Detailed monthly analytics' },
    { key: 'aiTips', name: 'AI Finance Buddy Tips', desc: 'Personalized financial advice' },
  ]

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Bell size={16} />
            </div>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Notifications
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <motion.div
            className="divide-y divide-border/50"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {notificationItems.map((item) => {
              const isEnabled =
                notifications[item.key as keyof typeof notifications]
              return (
                <motion.div
                  key={item.key}
                  variants={cardVariants}
                  className="flex items-center justify-between p-4 transition-all hover:bg-secondary/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Bell size={20} className="text-text-tertiary" />
                    </div>
                    <div>
                      <p className="font-medium text-text">{item.name}</p>
                      <p className="text-sm text-text-secondary">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleNotification(item.key as keyof typeof notifications)}
                    className={cn(
                      'relative flex h-8 w-14 min-h-[44px] min-w-[44px] cursor-pointer items-center rounded-full transition-colors',
                      isEnabled ? 'bg-workspace' : 'bg-border'
                    )}
                  >
                    <motion.div
                      className={cn(
                        'absolute top-1.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform'
                      )}
                      animate={{
                        x: isEnabled ? 28 : 4,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  </motion.button>
                </motion.div>
              )
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function Security() {
  const { updateUser } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setError('New password cannot be empty.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation must match.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateUser({ password: newPassword })
    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Shield size={16} />
            </div>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Security
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            <motion.div variants={cardVariants}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={cn(
                      'mt-1 w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                    )}
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={cn(
                      'mt-1 w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                    )}
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      'mt-1 w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-workspace focus:outline-none'
                    )}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </motion.div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-500">Password updated successfully.</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleChangePassword}
              disabled={saving || !newPassword.trim()}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50'
              )}
            >
              {saving ? 'Updating...' : 'Update Password'}
            </motion.button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function DataPrivacy() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const dataItems = [
    {
      id: 'export',
      icon: <Download size={20} />,
      title: 'Export Data',
      desc: 'Download a copy of your data',
      action: 'Export',
      variant: 'default' as const,
    },
    {
      id: 'backup',
      icon: <Save size={20} />,
      title: 'Backup',
      desc: 'Schedule automatic backups',
      action: 'Configure',
      variant: 'default' as const,
    },
    {
      id: 'privacy',
      icon: <Shield size={20} />,
      title: 'Privacy Settings',
      desc: 'Control your privacy preferences',
      action: 'Settings',
      variant: 'default' as const,
    },
    {
      id: 'delete',
      icon: <Trash2 size={20} />,
      title: 'Delete Account',
      desc: 'Permanently delete your account',
      action: 'Delete',
      variant: 'destructive' as const,
    },
  ]

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <Database size={16} />
            </div>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              Data & Privacy
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            {dataItems.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      item.variant === 'destructive'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-secondary text-text-tertiary'
                    )}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-text">{item.title}</p>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                  </div>
                </div>
                {item.id === 'delete' ? (
                  showDeleteConfirm ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <p className="text-sm font-medium text-red-500">
                        Are you sure?
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDeleteConfirm(false)}
                     className={cn(
                          'rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-border'
                        )}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                     className={cn(
                          'rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-500/20'
                        )}
                      >
                        Confirm Delete
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteConfirm(true)}
                      className={cn(
                        'rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-500 transition-all hover:bg-red-500/20'
                      )}
                    >
                      {item.action}
                    </motion.button>
                  )
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-text-secondary transition-all hover:bg-border'
                    )}
                  >
                    {item.action}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function AboutFinanceOS() {
  const appVersion = 'v2.5.0'
  const buildVersion = 'build-2026-07-31'
  const lastUpdated = 'July 31, 2026'
  const environment = 'Production'

  return (
    <motion.div variants={rowVariants}>
      <Card glass elevated className="border-0 p-0 shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
              <SettingsIcon size={16} />
            </div>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-text-secondary">
              About FinanceOS
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            <motion.div variants={cardVariants}>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                App Version
              </p>
              <p className="mt-1 text-xl font-semibold text-text">
                {appVersion}
              </p>
            </motion.div>

            <motion.div variants={cardVariants}>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Build Version
              </p>
              <p className="mt-1 text-xl font-semibold text-text">
                {buildVersion}
              </p>
            </motion.div>

            <motion.div variants={cardVariants}>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Last Updated
              </p>
              <p className="mt-1 text-xl font-semibold text-text">
                {lastUpdated}
              </p>
            </motion.div>

            <motion.div variants={cardVariants}>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Environment
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex h-2 w-2 rounded-full',
                    environment === 'Production'
                      ? 'bg-sri-500'
                      : 'bg-amber-500'
                  )}
                />
                <p className="text-xl font-semibold text-text">
                  {environment}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Settings() {
  const { currentWorkspace } = useWorkspace()

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8"
    >
      <motion.div
        variants={rowVariants}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-workspace/10 text-workspace">
            <SettingsIcon size={16} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Settings
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <CalendarDays size={14} className="text-text-tertiary" />
          <span>{dateLabel}</span>
          <span className="mx-2 text-text-tertiary">·</span>
          <span className="font-medium text-text">
            {currentWorkspace.name} • {currentWorkspace.currency.symbol}
          </span>
        </div>
      </motion.div>

      <Profile />

      <Appearance />

      <WorkspaceSelector />

      <CurrencyRegion />

      <Notifications />

      <Security />

      <DataPrivacy />

      <AboutFinanceOS />

      <motion.div
        variants={rowVariants}
        className="text-center text-sm text-text-tertiary"
      >
        © FinanceOS — Premium Financial Dashboard
      </motion.div>
    </motion.div>
  )
}

