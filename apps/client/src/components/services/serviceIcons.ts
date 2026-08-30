import type { IconType } from 'react-icons';
import {
  FaBolt,
  FaCubes,
  FaFaucet,
  FaFireExtinguisher,
  FaLightbulb,
  FaMoneyCheckAlt,
  FaNetworkWired,
  FaSnowflake,
  FaSolarPanel,
  FaTools,
  FaUserTie,
  FaWind,
} from 'react-icons/fa';

const SERVICE_ICON_REGISTRY: Record<string, IconType> = {
  FaBolt,
  FaCubes,
  FaFaucet,
  FaFireExtinguisher,
  FaLightbulb,
  FaMoneyCheckAlt,
  FaNetworkWired,
  FaSnowflake,
  FaSolarPanel,
  FaTools,
  FaUserTie,
  FaWind,
};

export function getServiceIcon(iconName: string): IconType {
  return SERVICE_ICON_REGISTRY[iconName] ?? FaTools;
}
