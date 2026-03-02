import Image from 'next/image'

const AdminSidebarLogo = () => {
  return (
    <div className="adminSidebarBrand" aria-label="DOB Admin">
      <Image className="adminSidebarBrand__logo" src="/brand/logo-white.png" alt="DOB" width={42} height={42} priority />
      <span className="adminSidebarBrand__text">DOB</span>
    </div>
  )
}

export default AdminSidebarLogo
