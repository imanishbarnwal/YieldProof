# Contributing to YieldProof

We welcome contributions to YieldProof! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- Basic understanding of Solidity and TypeScript
- Familiarity with Hardhat and Next.js

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/YieldProof.git
cd YieldProof
```

2. **Install Dependencies**
```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. **Environment Setup**
```bash
# Copy environment files
cp contracts/.env.example contracts/.env
cp frontend/.env.example frontend/.env.local

# Add your configuration
```

4. **Run Tests**
```bash
cd contracts
npm test
```

5. **Start Development Server**
```bash
cd frontend
npm run dev
```

## Contribution Areas

### 🐛 Bug Reports and Fixes

**Before Reporting:**
- Check existing issues
- Reproduce the bug
- Gather relevant information (OS, browser, wallet, etc.)

**Bug Report Template:**
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: 
- Browser: 
- Wallet: 
- Network: 

## Additional Context
Any other relevant information
```

### 📝 Documentation Improvements

We welcome improvements to:
- README and setup guides
- Code comments and documentation
- API documentation
- Tutorial content
- Architecture diagrams

### 🧪 Test Coverage Expansion

Help us improve test coverage:
- Add edge case tests
- Integration tests
- Gas optimization tests
- Security test scenarios
- Frontend component tests

### ⚡ Gas Optimization

Optimize contract gas usage:
- Analyze gas costs with `hardhat-gas-reporter`
- Optimize storage patterns
- Reduce external calls
- Batch operations where possible

### 🎨 Frontend Enhancements

Improve user experience:
- UI/UX improvements
- Mobile responsiveness
- Accessibility features
- Performance optimizations
- New features and components

### 🔐 Security Analysis

Help improve security:
- Security audits and reviews
- Vulnerability assessments
- Economic model analysis
- Attack vector identification

## Development Guidelines

### Code Style

**Solidity:**
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments for all public functions
- Prefer explicit over implicit
- Use meaningful variable names

**TypeScript/React:**
- Use TypeScript strict mode
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling

**General:**
- Write clear, self-documenting code
- Add comments for complex logic
- Use consistent naming conventions
- Keep functions small and focused

### Testing Requirements

**Smart Contracts:**
- All new functions must have tests
- Test both success and failure cases
- Include edge cases and boundary conditions
- Maintain 100% test coverage for critical functions

**Frontend:**
- Test user interactions
- Test error states
- Test responsive design
- Test accessibility features

### Git Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Write code following style guidelines
- Add tests for new functionality
- Update documentation as needed

3. **Commit Changes**
```bash
git add .
git commit -m "feat: add new feature description"
```

Use conventional commit format:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `test:` test additions/changes
- `refactor:` code refactoring
- `style:` formatting changes
- `chore:` maintenance tasks

4. **Push and Create PR**
```bash
git push origin feature/your-feature-name
```

### Pull Request Process

1. **Before Submitting:**
   - Ensure all tests pass
   - Update documentation
   - Check code style compliance
   - Rebase on latest main branch

2. **PR Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other (please describe)

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

3. **Review Process:**
   - Maintainers will review within 48 hours
   - Address feedback promptly
   - Maintain clean commit history
   - Squash commits if requested

## Security Considerations

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email security@yieldproof.xyz
2. Include detailed description
3. Provide proof of concept if possible
4. Allow reasonable time for response

### Security Guidelines

- Never commit private keys or secrets
- Use environment variables for sensitive data
- Follow smart contract security best practices
- Consider economic attack vectors
- Test with realistic scenarios

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different perspectives and experiences

### Communication Channels

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** General questions and ideas
- **Discord:** Real-time community chat (coming soon)
- **Twitter:** Updates and announcements

## Recognition

Contributors will be recognized in:
- README contributors section
- Release notes for significant contributions
- Special recognition for security findings
- Potential token rewards for major contributions (future)

## Getting Help

If you need help:
1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Reach out to maintainers

## License

By contributing to YieldProof, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to YieldProof! 🚀