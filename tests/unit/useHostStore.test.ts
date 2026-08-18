import { renderHook, act } from '@testing-library/react';
import { useHostStore, defaultHostData } from '../../hooks/useHostStore';

describe('useHostStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useHostStore.getState().reset();
    });
  });

  it('should initialize with default values and step 1', () => {
    const { result } = renderHook(() => useHostStore());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.hostData).toEqual(defaultHostData);
  });

  it('should navigate to next and previous steps correctly within bounds', () => {
    const { result } = renderHook(() => useHostStore());
    
    act(() => { result.current.nextStep(); });
    expect(result.current.currentStep).toBe(2);

    act(() => { result.current.setStep(6); });
    expect(result.current.currentStep).toBe(6);

    // Should not exceed 6
    act(() => { result.current.nextStep(); });
    expect(result.current.currentStep).toBe(6);

    act(() => { result.current.prevStep(); });
    expect(result.current.currentStep).toBe(5);
  });

  it('should update root level host data', () => {
    const { result } = renderHook(() => useHostStore());
    
    act(() => {
      result.current.updateData({ name: 'Test AI', age: '25' });
    });

    expect(result.current.hostData.name).toBe('Test AI');
    expect(result.current.hostData.age).toBe('25');
  });

  it('should update nested data correctly', () => {
    const { result } = renderHook(() => useHostStore());
    
    act(() => {
      result.current.updateNestedData('personality', { friendly: 1.0, funny: 0.1 });
    });

    expect(result.current.hostData.personality.friendly).toBe(1.0);
    expect(result.current.hostData.personality.funny).toBe(0.1);
    // Unchanged value should remain
    expect(result.current.hostData.personality.energetic).toBe(0.5);
  });
});
