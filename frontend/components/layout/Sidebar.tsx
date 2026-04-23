'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sprout,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/fields', label: 'Fields', icon: Sprout },
    ...(isAdmin
      ? [{ href: '/dashboard/users', label: 'Users', icon: Users }]
      : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.top}>
          <Link href="/dashboard" className={styles.logo} onClick={() => setIsOpen(false)}>
            <span className={styles.logoIcon}>🌾</span>
            <span className={styles.logoText}>Smartseason</span>
          </Link>

          <nav className={styles.nav}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${
                    isActive(item.href) ? styles.active : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.bottom}>
          <div className={styles.user}>
            <div className={styles.avatar}>
              {getInitials(user.first_name, user.last_name)}
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>
                {user.first_name} {user.last_name}
              </p>
              <Badge variant="role" value={user.role} />
            </div>
          </div>
          <button className={styles.logout} onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
