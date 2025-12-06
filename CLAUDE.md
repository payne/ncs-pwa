# Folder structure
- services should all be stored in central _services/ folder. Service file name should describe what the service does. please ensure methods are called at least once (unless private - no dead code)

- interfaces/models should all be stored in _models. The model file name format should be the reference component names .model.ts. So if your base component is ncs-search, the model attached to it would be ncs-search.model.ts.

- resolvers should be installed in _resolvers. The resolver file name format should be reference component names .resolver.ts. So if your base component is ncs-search, the model attached to it would be ncs-search.resolver.ts. resolver global variables begin with an underscore

- Shared components like a header and footer should be stored in _shared-components/ and then their own subdirectory for the individual component.

- guards should be stored in _guards/

- interceptors should be stored in _interceptors/

- All test/mock data should be stored in _test-data/ directory
- Test data files should follow the naming pattern: [component-name].test.json

- For this project, all other components should have ncs as the prefect with a hyphen, and then the function if applicable. Examples: ncs-operator-manage

# Routes
- Make sure the angular route path matches the name of the component. So if the component folder name is /ncs-component, the route should be /ncs-component

# CSS rules
- All colors should be stored as variables in the styles.css file
- No empty classes
- No unused classes - IMPORTANT: Always verify that CSS classes defined in component stylesheets are actually used in the component's HTML template. Remove any classes that are not referenced.
- No inline styles, should be converted to classes
- CSS should use bootstrap grid system as often as possible for responsiveness. Reduced use of viewport sizes is preferred to reduce complexity.  
- Any shared stylings that appear across all components should be the style.css file
- Avoid using ng-deep as it is deprecated
- Media queries should always been at the bottom of the css file and be in order of smallest to largest pixel size

## Standard Modal Styling
- All standard modals (forms, information, etc.) should have blue header styling
- Modal header should use var(--color-primary) (#1e3a62) background with white text
- Modal title should be white with font-weight: 500
- This provides consistent branding across the application
- Error modals will use (#red) as background color white white text.
- Warning modals will use (#fff200) as background with black text.
- Success modals will use (#green) as background color with white text.
- Modals should stick to the preset bootstrap sizes (modal-sm, modal-lg, modal-xl). We should avoid any custom sizing if possible to reduce complexity. 

# Bootstrap breakpoints
Try to stick with these media breakpoints since they are bootstrap standards if something custom is needed that can't be solved with the bootstrap grid system
@media (min-width: 576px) { ... }
@media (min-width: 768px) { ... }
@media (min-width: 992px) { ... }
@media (min-width: 1200px) { ... }

# Icons
- This project uses all Font Awesome icons and no bootstrap icons