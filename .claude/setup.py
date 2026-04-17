#!/usr/bin/env python3
"""
Domain and Tech Stack Detector for Claude Code
Usage:
  python setup.py                    # Interactive mode
  python setup.py --domain software --stack react expo node postgresql
  python setup.py --auto-detect
  python setup.py --list-domains
  python setup.py --list-stacks
"""

import json
import os
import sys
from pathlib import Path

# Domain definitions
DOMAINS = {
    "software": {
        "description": "Software Development",
        "skills": ["global/*", "software/*"],
        "commands": ["plan*", "code", "test", "debug", "fix*"],
    },
    "marketing": {
        "description": "Marketing",
        "skills": ["global/*", "marketing/*"],
        "commands": ["seo*", "content*", "design*"],
    },
}

# Tech stack detection
TECH_STACKS = {
    # Frontend
    "react": {"skills": ["software/development/react", "software/frontend-design"]},
    "vue": {"skills": ["software/development/vue"]},
    "angular": {"skills": ["software/development/angular"]},
    "expo": {"skills": ["software/expo"]},
    "react-native": {"skills": ["software/react-native"]},
    # Backend
    "node": {"skills": ["software/backend"]},
    "python": {"skills": ["software/development/python"]},
    "fastapi": {"skills": ["software/development/python-fastapi"]},
    "django": {"skills": ["software/development/python-django"]},
    # Database
    "postgresql": {"skills": ["software/database/postgresql"]},
    "mongodb": {"skills": ["software/database/mongodb"]},
    "supabase": {"skills": ["software/database/supabase"]},
    "mysql": {"skills": ["software/database/mysql"]},
    # Languages
    "csharp": {"skills": ["software/csharp-expert"]},
    "go": {"skills": ["software/go"]},
    "rust": {"skills": ["software/rust"]},
}


def detect_from_package_json():
    """Detect tech stack from package.json"""
    if not os.path.exists("package.json"):
        return []
    try:
        pkg = json.load(open("package.json"))
        deps = list(pkg.get("dependencies", {}).keys())
        stacks = []
        # Check each tech stack
        for stack in TECH_STACKS:
            if stack == "node":
                # Check for express, koa, fastify, etc (Node.js frameworks)
                if any(p in deps for p in ["express", "koa", "fastify", "hapi", "nest", "sails"]):
                    stacks.append("node")
            elif stack in deps or f"@{stack}" in deps:
                stacks.append(stack)
        return stacks
    except:
        return []


def detect_from_files():
    """Detect tech stack from file structure"""
    stacks = []
    if os.path.exists("app.py") or os.path.exists("main.py"):
        if "python" not in stacks:
            stacks.append("python")
    if os.path.exists("requirements.txt"):
        with open("requirements.txt") as f:
            content = f.read()
            if "django" in content or "flask" in content:
                stacks.append("python")
    if os.path.exists("expo"):
        stacks.append("expo")
    if os.path.exists("src/App.tsx") or os.path.exists("src/App.js"):
        stacks.append("react")
    return stacks


def get_relevant_skills(domain, stacks):
    """Get skills for domain and tech stack"""
    skills = DOMAINS.get(domain, {}).get("skills", []).copy()
    for stack in stacks:
        skills.extend(TECH_STACKS.get(stack, {}).get("skills", []))
    return list(set(skills))


def get_commands(domain):
    """Get commands for domain"""
    return DOMAINS.get(domain, {}).get("commands", [])


def interactive_mode():
    """Interactive mode - prompt user for domain and tech stack"""
    print("\n=== Claude Code Setup ===")
    print("Available domains:", ", ".join(DOMAINS.keys()))
    print("Available tech stacks:", ", ".join(TECH_STACKS.keys()))
    print()

    # Select domain
    domain = input("Enter domain (software/marketing) [software]: ").strip() or "software"
    if domain not in DOMAINS:
        print(f"Invalid domain. Using 'software'.")
        domain = "software"

    # Select tech stacks
    print(f"\nSelect tech stack for {domain}:")
    print("Available:", ", ".join(TECH_STACKS.keys()))
    stack_input = input("Enter stacks (comma-separated) or press Enter to auto-detect: ").strip()

    if stack_input:
        stacks = [s.strip() for s in stack_input.split(",")]
    else:
        # Auto-detect
        stacks = detect_from_package_json()
        stacks.extend(detect_from_files())
        stacks = list(set(stacks))
        if stacks:
            print(f"Auto-detected: {', '.join(stacks)}")
        else:
            print("No tech stack detected. Please enter manually.")
            stacks = []

    skills = get_relevant_skills(domain, stacks)
    commands = get_commands(domain)

    result = {
        "domain": domain,
        "tech_stack": stacks,
        "skills": skills,
        "commands": commands,
    }
    print("\n=== Result ===")
    print(json.dumps(result, indent=2))

    # Print recommendations
    print("\n=== Recommended Skills ===")
    for skill in skills:
        print(f"  - {skill}")
    print("\n=== Recommended Commands ===")
    for cmd in commands:
        print(f"  - /{cmd}")


def main():
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--domain", default="software", choices=list(DOMAINS.keys()))
    parser.add_argument("--stack", nargs="+", default=[])
    parser.add_argument("--auto-detect", action="store_true")
    parser.add_argument("--list-domains", action="store_true")
    parser.add_argument("--list-stacks", action="store_true")
    parser.add_argument("--interactive", "-i", action="store_true", help="Interactive mode")
    args = parser.parse_args()

    if args.interactive:
        interactive_mode()
        return

    if args.list_domains:
        print(json.dumps(DOMAINS, indent=2))
        return

    if args.list_stacks:
        print(json.dumps(TECH_STACKS, indent=2))
        return

    if args.auto_detect:
        args.stack = detect_from_package_json()
        args.stack.extend(detect_from_files())
        args.stack = list(set(args.stack))

    skills = get_relevant_skills(args.domain, args.stack)
    commands = get_commands(args.domain)

    result = {
        "domain": args.domain,
        "tech_stack": args.stack,
        "skills": skills,
        "commands": commands,
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()