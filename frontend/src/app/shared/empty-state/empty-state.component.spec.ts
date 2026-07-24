import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;

  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EmptyStateComponent] }).compileComponents();
    fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'You have not registered any expenses yet.');
    fixture.componentRef.setInput('actionLabel', 'Add');
    await fixture.whenStable();
  });

  it('renders the message and the action label', () => {
    expect(html().querySelector('.empty-state__message')?.textContent).toBe(
      'You have not registered any expenses yet.',
    );
    expect(html().querySelector('button')?.textContent).toContain('Add');
  });

  it('emits action when the button is clicked', () => {
    let emitted = false;
    fixture.componentInstance.action.subscribe(() => (emitted = true));
    html().querySelector('button')!.click();
    expect(emitted).toBe(true);
  });
});
