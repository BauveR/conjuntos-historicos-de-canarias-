// Backward-compat shim — prefer useDataContext or useMapUIContext directly
import { useDataContext } from './DataContext'
import { useMapUIContext } from './MapUIContext'

export function useAppContext() {
  return { ...useDataContext(), ...useMapUIContext() }
}
