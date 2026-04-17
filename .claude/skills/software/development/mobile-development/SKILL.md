---
name: mobile-development
description: Build modern mobile applications with React Native and Expo. Covers mobile-first design principles, performance optimization (battery, memory, network), offline-first architecture, platform-specific guidelines (iOS HIG, Material Design), testing strategies, security best practices, accessibility, app store deployment, and mobile development mindset. Use when building mobile apps, implementing mobile UX patterns, optimizing for mobile constraints, or making React Native vs Expo decisions.
license: MIT
version: 2.0.0
---

# Mobile Development Skill

Production-ready mobile development with modern frameworks, best practices, and mobile-first thinking patterns.

## When to Use

- Building mobile applications (iOS, Android, or cross-platform)
- Implementing mobile-first design and UX patterns
- Optimizing for mobile constraints (battery, memory, network, small screens)
- Making React Native vs Expo technology decisions
- Implementing offline-first architecture and data sync
- Following platform-specific guidelines (iOS HIG, Material Design)
- Optimizing mobile app performance and user experience
- Implementing mobile security and authentication
- Testing mobile applications (unit, integration, E2E)
- Deploying to App Store and Google Play

## Technology Selection Guide

**React Native Ecosystem:**
- **React Native (CLI)**: Full native control, custom native modules, bare workflow
- **Expo**: Managed workflow, fastest development, best for most projects
- **Expo Router**: File-based navigation, native routing, API routes

See: `references/mobile-frameworks.md` for detailed framework comparisons

## Mobile Development Mindset

**The 10 Commandments of Mobile Development:**

1. **Performance is Foundation, Not Feature** - 70% abandon apps >3s load time
2. **Every Kilobyte, Every Millisecond Matters** - Mobile constraints are real
3. **Offline-First by Default** - Network is unreliable, design for it
4. **User Context > Developer Environment** - Think real-world usage scenarios
5. **Platform Awareness Without Platform Lock-In** - Respect platform conventions
6. **Iterate, Don't Perfect** - Ship, measure, improve cycle is survival
7. **Security and Accessibility by Design** - Not afterthoughts
8. **Test on Real Devices** - Simulators lie about performance
9. **Architecture Scales with Complexity** - Don't over-engineer simple apps
10. **Continuous Learning is Survival** - Mobile landscape evolves rapidly

See: `references/mobile-mindset.md` for thinking patterns and decision frameworks

## Reference Navigation

**Core Technologies:**
- `mobile-frameworks.md` - React Native vs Expo comparison, when to use each
- `mobile-ios.md` - iOS architecture patterns, HIG, App Store requirements
- `mobile-android.md` - Android architecture patterns, Material Design

**Best Practices & Development Mindset:**
- `mobile-best-practices.md` - Mobile-first design, performance optimization, offline-first architecture, security, testing, accessibility, deployment, analytics
- `mobile-debugging.md` - Debugging tools, performance profiling, crash analysis, network debugging, platform-specific debugging
- `mobile-mindset.md` - Thinking patterns, decision frameworks, platform-specific thinking, common pitfalls, debugging strategies

## Skill Integration

This skill integrates with specialized React Native and Expo skills:

- **expo** - Expo-specific skills for building, deploying, and upgrading Expo apps
- **react-native-best-practices** - Performance optimization (FPS, TTI, bundle size, memory)
- **react-native-brownfield-migration** - Migration from native apps or existing code
- **react-native-upgrading** - Upgrading React Native versions and dependencies
- **react-native-github-actions** - CI/CD for React Native with GitHub Actions

See: `../expo/SKILL.md` and `../react-native/*/SKILL.md` for details

## Key Best Practices (2025)

**Performance Targets:**
- App launch: <2 seconds (70% abandon if >3s)
- Memory usage: <100MB for typical screens
- Network requests: Batch and cache aggressively
- Battery impact: Respect Doze Mode and background restrictions
- Animation: 60 FPS (16.67ms per frame)

**Architecture:**
- MVVM for small-medium apps (clean separation, testable)
- MVVM + Clean Architecture for large enterprise apps
- Offline-first with hybrid sync (push + pull)
- State management: Zustand, Jotai, or React Context (React Native)

**Security (OWASP Mobile Top 10):**
- OAuth 2.0 + JWT + Biometrics for authentication
- Keychain (iOS) / KeyStore (Android) for sensitive data
- Certificate pinning for network security
- Never hardcode credentials or API keys
- Implement proper session management

**Testing Strategy:**
- Unit tests: 70%+ coverage for business logic (Jest)
- Integration tests: Critical user flows
- E2E tests: Detox (React Native), Appium (cross-platform)
- Real device testing mandatory before release

**Deployment:**
- Fastlane for automation across platforms
- Staged rollouts: Internal → Closed → Open → Production
- Mandatory: iOS 17 SDK (2024), Android 15 API 35 (Aug 2025)
- CI/CD saves 20% development time

## Quick Decision Matrix

| Need | Choose |
|------|--------|
| JavaScript team, web code sharing | React Native |
| Rapid prototyping, fastest development | Expo |
| Enterprise with JavaScript skills | React Native (CLI) |
| Need file-based routing | Expo Router |
| Custom native modules required | React Native (bare workflow) |
| Full native control | React Native (CLI) |

## Framework Quick Comparison (2025)

| Criterion | React Native | Expo | Expo Router |
|-----------|--------------|------|-------------|
| **Stars** | 121K | N/A | N/A |
| **Adoption** | 35% of cross-platform | Growing | Growing |
| **Performance** | 80-90% native | 80-90% native | 80-90% native |
| **Dev Speed** | Fast (hot reload) | Fastest (HMR) | Fast (HMR) |
| **Learning Curve** | Easy (JS/TS) | Easy (JS/TS) | Easy (file-based) |
| **UI Paradigm** | Component-based | Component-based | File-based routing |
| **Community** | Huge (npm) | Large | Growing |
| **Best For** | Full native control | Fastest dev, managed | File-based navigation |

## Implementation Checklist

**Project Setup:**
- Choose framework → Initialize project → Configure dev environment → Setup version control → Configure CI/CD → Team standards

**Architecture:**
- Choose pattern (MVVM/Clean) → Setup folders → State management → Navigation → API layer → Error handling → Logging

**Core Features:**
- Authentication → Data persistence → API integration → Offline sync → Push notifications → Deep linking → Analytics

**UI/UX:**
- Design system → Platform guidelines → Accessibility → Responsive layouts → Dark mode → Localization → Animations

**Performance:**
- Image optimization → Lazy loading → Memory profiling → Network optimization → Battery testing → Launch time optimization

**Quality:**
- Unit tests (70%+) → Integration tests → E2E tests → Accessibility testing → Performance testing → Security audit

**Security:**
- Secure storage → Authentication flow → Network security → Input validation → Session management → Encryption

**Deployment:**
- App icons/splash → Screenshots → Store listings → Privacy policy → TestFlight/Internal testing → Staged rollout → Monitoring

## Platform-Specific Guidelines

**iOS (Human Interface Guidelines):**
- Native navigation patterns (tab bar, navigation bar)
- iOS design patterns (pull to refresh, swipe actions)
- San Francisco font, iOS color system
- Haptic feedback, 3D Touch/Haptic Touch
- Respect safe areas and notch

**Android (Material Design 3):**
- Material navigation (bottom nav, navigation drawer)
- Floating action buttons, material components
- Roboto font, Material You dynamic colors
- Touch feedback (ripple effects)
- Respect system bars and gestures

## Common Pitfalls to Avoid

1. **Testing only on simulators** - Real devices show true performance
2. **Ignoring platform conventions** - Users expect platform-specific patterns
3. **No offline handling** - Network failures will happen
4. **Poor memory management** - Leads to crashes and poor UX
5. **Hardcoded credentials** - Security vulnerability
6. **No accessibility** - Excludes 15%+ of users
7. **Premature optimization** - Optimize based on metrics, not assumptions
8. **Over-engineering** - Start simple, scale as needed
9. **Skipping real device testing** - Simulators don't show battery/network issues
10. **Not respecting battery** - Background processing must be justified

## Performance Budgets

**Recommended Targets:**
- **App size**: <50MB initial download, <200MB total
- **Launch time**: <2 seconds to interactive
- **Screen load**: <1 second for cached data
- **Network request**: <3 seconds for API calls
- **Memory**: <100MB for typical screens, <200MB peak
- **Battery**: <5% drain per hour of active use
- **Frame rate**: 60 FPS (16.67ms per frame)

## Resources

**Official Documentation:**
- React Native: https://reactnative.dev/
- Expo: https://expo.dev/
- Expo Router: https://expo.dev/router
- iOS HIG: https://developer.apple.com/design/human-interface-guidelines/
- Material Design: https://m3.material.io/
- OWASP Mobile: https://owasp.org/www-project-mobile-top-10/

**Tools & Testing:**
- Detox E2E: https://wix.github.io/Detox/
- Appium: https://appium.io/
- Fastlane: https://fastlane.tools/
- Firebase: https://firebase.google.com/

**Community:**
- React Native Directory: https://reactnative.directory/
- Awesome React Native: https://github.com/jondot/awesome-react-native
- Expo Forums: https://forums.expo.dev/
