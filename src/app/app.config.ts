import { ApplicationConfig, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../../libs/core/auth/auth.interceptor';
import { apiInterceptor } from '../../libs/core/api/api.interceptor';
import { 
  LucideAngularModule, 
  LayoutDashboard, 
  FileText, 
  User, 
  Grid, 
  Printer, 
  Layers, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Package,
  ShoppingCart,
  Zap,
  Clock,
  Briefcase,
  Users,
  Hammer,
  LogOut,
  Menu,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  Plus,
  Monitor,
  Trash2,
  X,
  Activity,
  UserCog,
  Database,
  Pin,
  PinOff,
  Search,
  Cpu,
  Box,
  ClipboardList,
  Trees,
  HardHat,
  PackageSearch
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor, authInterceptor])),
    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard,
        FileText,
        User,
        Grid,
        Printer,
        Layers,
        BarChart3,
        Settings,
        ChevronLeft,
        ChevronRight,
        Package,
        ShoppingCart,
        Zap,
        Clock,
        Briefcase,
        Users,
        Hammer,
        LogOut,
        Menu,
        Bell,
        Sun,
        Moon,
        ChevronDown,
        Building2,
        Plus,
        Monitor,
        Trash2,
        X,
        Activity,
        UserCog,
        Database,
        Pin,
        PinOff,
        Search,
        Cpu,
        Box,
        ClipboardList,
        Trees,
        HardHat,
        PackageSearch
      })
    )
  ]
};
