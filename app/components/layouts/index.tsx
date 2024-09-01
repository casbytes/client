import { LuLayoutDashboard } from "react-icons/lu";
import {
  FaBook,
  FaRegCircleUser,
  FaRegCreditCard,
  FaSignal,
  FaUsers,
} from "react-icons/fa6";
import { MdOutlineArticle, MdOutlineDirections } from "react-icons/md";
import { SiBookstack } from "react-icons/si";
export { RootLayout } from "./root-layout";

const ARTICLE_URL = "https://articles.casbytes.com";
const STATUS_URL = "https://status.casbytes.com";

export const unAuthMenuItems = [
  { label: "courses", href: "/#courses" },
  { label: "modules", href: "/#modules" },
  { label: "features", href: "/#features" },
  { label: "subscription", href: "/#subscription" },
  { label: "FAQs", href: "faqs" },
  {
    label: "articles",
    href: ARTICLE_URL,
    target: "_blank",
  },
];

export const userMenuItems = [
  {
    icon: <LuLayoutDashboard size={30} />,
    label: "dashboard",
    href: "dashboard",
  },
  {
    icon: <MdOutlineDirections size={30} />,
    label: "onboarding",
    href: "onboarding",
  },
  {
    icon: <SiBookstack size={30} />,
    label: "courses",
    href: "courses",
  },
  {
    icon: <FaBook size={30} />,
    label: "modules",
    href: "modules",
  },
  {
    icon: <FaRegCreditCard size={30} />,
    label: "subscription",
    href: "subscription",
  },
  {
    icon: <MdOutlineArticle size={30} />,
    label: "articles",
    href: ARTICLE_URL,
    target: "_blank",
  },
  {
    icon: <FaSignal size={30} />,
    label: "status",
    href: STATUS_URL,
    target: "_blank",
  },
  {
    icon: <FaRegCircleUser size={30} />,
    label: "profile",
    href: "profile",
  },
];

export const adminMenuItems = [
  {
    icon: <LuLayoutDashboard size={30} />,
    label: "dashboard",
    href: "a",
  },
  {
    icon: <FaUsers size={30} />,
    label: "users",
    href: "a/users",
  },
  {
    icon: <MdOutlineArticle size={30} />,
    label: "articles",
    href: ARTICLE_URL,
    target: "_blank",
  },
  {
    icon: <FaSignal size={30} />,
    label: "status",
    href: STATUS_URL,
    target: "_blank",
  },
  {
    icon: <FaRegCircleUser size={30} />,
    label: "profile",
    href: "a/profile",
  },
];
